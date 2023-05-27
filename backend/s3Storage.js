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

app.post('/upload', upload.single('file'), async function (req, res, next) {
    const params = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: req.file.key,
        Body: req.file.buffer
    };

    const s3Upload = await s3.upload(params).promise();

    // Now update your DynamoDB table
    let fileLink = s3Upload.Location;
    const dbParams = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: {
            "primary-key": "key-value"
        },
        UpdateExpression: "set description = :d, fileLink = :f, s3_key = :k",
        ExpressionAttributeValues:{
            ":d": req.body.description,
            ":f": fileLink,
            ":k": req.file.key
        },
        ReturnValues:"UPDATED_NEW"
    };

    const dynamoResponse = await dynamoDb.update(dbParams).promise();
    res.send({ s3Upload, dynamoResponse });
});


app.listen(port, () => {
    console.log(`App listening at port ${port}`)
});