class ProjectManager {
    constructor(s3, dynamoDB, docker, tableName, s3BucketName, homeDir) {
        this.s3 = s3;
        this.dynamoDB = dynamoDB;
        this.docker = docker;
        this.tableName = tableName;
        this.s3BucketName = s3BucketName;
        this.homeDir = homeDir;
    }

    async getProjectFiles(userId, projectName) {
        const projectMetadata = await this.getProjectMetadata(userId, projectName);

        if (!projectMetadata) {
            return {};
        }

        return await this.buildProject(projectMetadata);
    }

    async getProjectMetadata(userId, projectName) {
        const params = {
            TableName: this.tableName,
            KeyConditionExpression: 'PK = :pk AND begins_with(SK, :sk_prefix)',
            ExpressionAttributeValues: {
                ':pk': `user#${userId}`,
                ':sk_prefix': `project#${projectName}_file#`
            }
        };

        try {
            const response = await this.dynamoDB.query(params).promise();
            return response.Items || [];
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    async buildProject(dynamoData) {
        if (!dynamoData) {
            console.error('Invalid files data');
            return {};
        }

        const fileMetadata = {};

        for (const file of dynamoData) {
            const filePath = file.SK.split('#')[2];

            fileMetadata[filePath] = {
                fileLink: file.fileLink,
                language: file.language,
                Key: file.s3_key
            };

            try {
                const s3ResponseObject = await this.s3.getObject({ Bucket: this.s3BucketName, Key: file.s3_key }).promise();
                fileMetadata[filePath].content = s3ResponseObject.Body.toString('utf-8');
            } catch (error) {
                console.error(error);
            }
        }

        return fileMetadata;
    }

    async saveFile(userId, projectName, containerId, filePath, fileContent = '', language = 'python') {
        const s3_key = `${userId}/${projectName}/${filePath}`;
        let s3Response;

        try {
            s3Response = await this.s3.putObject({
                Bucket: this.s3BucketName,
                Key: s3_key,
                Body: fileContent
            }).promise();
        } catch (error) {
            throw new Error(`Error uploading to S3: ${error}`);
        }

        const item = {
            PK: `user#${userId}`,
            SK: `project#${projectName}_file#${filePath}`,
            fileLink: s3Response.Location || '',
            Key: s3_key,
            language: language,
            containerId: containerId
        };

        try {
            const dynamoResponse = await this.dynamoDB.put({ TableName: this.tableName, Item: item }).promise();
            return { s3Upload: s3Response, dynamoResponse: dynamoResponse };
        } catch (error) {
            throw new Error(`Error updating DynamoDB: ${error}`);
        }
    }
}

module.exports = ProjectManager;
