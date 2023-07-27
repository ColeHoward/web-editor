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
});

const s3 = new AWS.S3({
    region: process.env.S3_REGION
});

const dynamoDb = new AWS.DynamoDB.DocumentClient({
    region: process.env.DYNAMO_REGION
});



const app = express();
app.use(bodyParser.json());
app.use(cors());

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

// this will either create a new file or update an existing one
app.put('/put-file', upload.single('file'), async function (req, res, next) {
    // formData.append('userId', userId);
    // formData.append('projectId', projectId);
    // formData.append('filename', fileName)
    // formData.append('code', fileContent);
    // formData.append('language', language);

    const codeString = req.body.code;  // not storing on DynamoDB, only S3
    const userId = req.body.userId
    const projectId = req.body.projectId // may not be needed because path has project name in it?
    const filename = req.body.filename
    const language = req.body.language
    console.log('filename:', filename)
    // const projectType = req.body.projectType // e.g. html, js, python, etc., could maybe just append to project name
    // TODO add container ID for the project, either in the project name or as a separate field
    /*********************************************** STORE FILES ON S3 ***********************************************/
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: `${userId}/${projectId}/${filename}`,
        Body: codeString  // file content
    };
    let s3Upload;
    try {
        s3Upload = await s3.upload(params).promise();  // similar to PUT request
    } catch (error) {
        console.error('Error uploading to S3:', error);
        res.status(500).send(error);
        return;
    }

    /*********************** STORE METADATA WITH FLATTENED HIERARCHICAL STRUCTURE  ON DYNAMODB ***********************/
    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: {
            "PK": `user#${userId}`,
            "SK": `project#${projectId}_file#${filename}`,
            "fileLink": s3Upload.Location,
            "s3_key": s3Upload.Key,
            "language": language,
        }
    };

    let dynamoResponse;
    try {
        dynamoResponse = await dynamoDb.put(dbParams).promise();
    } catch (error) {
        console.error('Error updating DynamoDB:', error);
    }

    res.send({ s3Upload, dynamoResponse });
});

// should have authentication in production (so someone that gets their userId can't see all their projects)
app.get('/get-project-metadata', async function(req, res, next) {
    const userId = req.query.userId;
    const projectId = req.query.projectId;

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