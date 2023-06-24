const express = require('express');
const multer = require('multer');
const multerS3 = require('multer-s3');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const cors = require('cors');


require('dotenv').config();

const port = 3002;

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});


const app = express();
app.use(bodyParser.json());
app.use(cors());
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_S3_BUCKET_NAME,
        metadata: function (req, file, cb) {
            cb(null, { fieldName: file.fieldname });
        },
        key: function (req, file, cb) {
            cb(null, Date.now().toString() + "-" + file.originalname)
        }
    })
});
// Cole/testProject/src/test.py
// Cole/testProject/src/test.py
// project#testProject_path#src/test.py
// this will either create a new file or update an existing one
app.post('/put-file', upload.single('file'), async function (req, res, next) {
    const codeString = req.body.code;  // not storing on DynamoDB, only S3
    const userId = req.body.userId
    const projectId = req.body.projectId // may not be needed because path has project name in it?
    const filename = req.body.filename
    const language = req.body.language
    const type = req.body.type  // file or directory; not really necessary b/c only upload files
    // const projectType = req.body.projectType // e.g. html, js, python, etc., could maybe just append to project name

    /************************** STORE PROJECTS WITH FLATTENED HIERARCHICAL STRUCTURE ON S3 **************************/
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${userId}/${projectId}/${filename}`,
        Body: codeString  // file content
    };
    let s3Upload;
    try {
        s3Upload = await s3.upload(params).promise();  // similar to PUT request
        console.log('S3 Upload Response:', s3Upload);
    } catch (error) {
        console.error('Error uploading to S3:', error);
        res.status(500).send(error);
        return;
    }

    /*************************************** UPLOAD METADATA TO DYNAMODB ***************************************/
    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            "PK": `user#${userId}`,
            "SK": `project#${projectId}_file#${filename}`,
            "fileLink": s3Upload.Location,
            "s3_key": s3Upload.Key,
            "language": language,
            "type": type
        }
    };

    let dynamoResponse;
    try {
        dynamoResponse = await dynamoDb.put(dbParams).promise();
        console.log('DynamoDB Response:', dynamoResponse);
    } catch (error) {
        console.error('Error updating DynamoDB:', error);
    }

    res.send({ s3Upload, dynamoResponse });
});

// should have authentication in production (so someone that gets their userId can't see all their projects)
app.get('/get-project-metadata', async function(req, res, next) {
    const userId = req.query.userId;  // Get userId from the query params
    const projectId = req.query.projectId;  // Get projectId from the query params

    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
        ExpressionAttributeValues: {
            ':pk': `user#${userId}`,
            ':sk_prefix': `project#${projectId}_file#`,
        },
    };

    let dynamoResponse;
    try {
        dynamoResponse = await dynamoDb.query(dbParams).promise();
        console.log('DynamoDB Response:', dynamoResponse);
    } catch (error) {
        console.error('Error querying DynamoDB:', error);
        res.status(500).send(error);
        return;
    }
    if (dynamoResponse.Items) {
        res.json(dynamoResponse.Items);
    } else {
        res.status(404).send('No files found for this project');
    }
});

// return the files instead of the file links
// app.get('/get-project-files', async function(req, res, next) {
//     const userId = req.query.userId;  // Get userId from the query params
//     const projectId = req.query.projectId;  // Get projectId from the query params
//
//     const dbParams = {
//         TableName: process.env.DYNAMODB_TABLE_NAME,
//         KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
//         ExpressionAttributeValues: {
//             ':pk': `user#${userId}`,
//             ':sk_prefix': `project#${projectId}_file#`,
//         },
//     };
//
//     let dynamoResponse;
//     try {
//         dynamoResponse = await dynamoDb.query(dbParams).promise();
//         console.log('DynamoDB Response:', dynamoResponse);
//     } catch (error) {
//         console.error('Error querying DynamoDB:', error);
//         res.status(500).send(error);
//         return;
//     }
//
//     // Get the actual file from S3 using the file links or S3 keys
//     let files = await Promise.all(dynamoResponse.Items.map(async (item) => {
//         const params = {
//             Bucket: process.env.AWS_S3_BUCKET_NAME,
//             Key: item.s3_key,
//         };
//
//         try {
//             let s3File = await s3.getObject(params).promise();
//             console.log('S3 File:', s3File);
//
//             // Return a new object containing both metadata from DynamoDB and actual file from S3
//             return {
//                 ...item,
//                 file: s3File.Body.toString(),  // Convert file content to string assuming it's text
//             };
//         } catch (error) {
//             console.error('Error getting file from S3:', error);
//             throw error;  // If one file fails to load from S3, it will stop the whole operation
//         }
//     }));
//
//     res.send({ files });
// });\
app.get('/get-file', async function(req, res, next) {
    const s3_key = req.query.s3_key;  // Get s3_key from the query params

    // Setup the parameters for the getObject request
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3_key
    };

    // Try to get the file from s3
    s3.getObject(params, function(err, data) {
        if (err) {
            console.error(err);
            res.status(500).send(err);
        } else {
            const fileContent = data.Body.toString();
            res.send(fileContent);
        }
    });
});




app.listen(port, () => {
    console.log(`App listening at port ${port}`)
});