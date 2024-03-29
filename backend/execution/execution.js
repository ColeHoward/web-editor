const express = require('express');
const cors = require('cors');
const multer = require('multer');
const Docker = require('dockerode');
const AWS = require('aws-sdk');
const ProjectManager = require('./ProjectManager');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env' });

const app = express();
app.use(cors());
app.use(express.json());

// Setup AWS clients
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.S3_REGION
});

const dynamodb = new AWS.DynamoDB.DocumentClient({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.DYNAMO_REGION
});

const docker = new Docker();  // Docker client

const homeDir = '/home/appuser';

const PM = new ProjectManager(s3, dynamodb, docker, process.env.DYNAMODB_TABLE_NAME,
                                                process.env.AWS_S3_BUCKET_NAME, homeDir);

// Multer middleware for handling form-data
// Multer configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Set destination directory for uploaded files
        const dir = './uploads';

        // Create directory if it doesn't exist
        fs.access(dir, fs.constants.F_OK, (err) => {
            if (err) {
                return fs.mkdir(dir, { recursive: true }, error => cb(error, dir));
            }
            return cb(null, dir);
        });
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

let containerActivity = {};  // Maps container IDs to the last time they were active

const baseDir = process.env.BASE_DIR;

app.post('/projects', upload.none(), async (req, res) => {
    const { userId, projectName } = req.body;
    if (!projectName) {
        return res.status(400).send("Project name is required");
    }

    if (!userId) {
        return res.status(400).send("User ID is required");
    }
    let hostProjectPath = "";
    try {
        hostProjectPath = path.join(baseDir, userId, projectName);

        fs.mkdirSync(hostProjectPath, { recursive: true });

        const mainPyContent = "print('Hello, World!')";
        const requirementsTxtContent = "";

        fs.writeFileSync(path.join(hostProjectPath, 'main.py'), mainPyContent);
        fs.writeFileSync(path.join(hostProjectPath, 'requirements.txt'), requirementsTxtContent);
        PM.saveFile(userId, projectName, 'main.py', mainPyContent);
        PM.saveFile(userId, projectName, 'requirements.txt', requirementsTxtContent);

    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to create project");
    }
    try {
        if (!hostProjectPath) { return res.status(500).send("Failed to create Docker container");}
        const command = ['bash', '-c',
            `pip install --user -r /home/appuser/${projectName}/requirements.txt && tail -f /dev/null`]

        const container = await docker.createContainer({
            Image: 'python-project',
            AttachStdout: true,
            AttachStderr: true,
            User: 'appuser',
            Tty: true,
            Cmd: command,
            WorkingDir: '/home/appuser',
            HostConfig: {
                Binds: [`${hostProjectPath}:/home/appuser/${projectName}`]
            }
        });

        await container.start();
        containerActivity[container.id] = Date.now();
        return res.json({ container_id: container.id });
    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to create Docker container");
    }
});


app.post('/projects/:projectName', async (req, res) => {
    const userId = req.body.userId;
    const projectName = req.params.projectName;
    console.log(userId, projectName)
    if (!projectName || !userId) {
        return res.status(400).json({ error: 'User ID and Project name are required' });
    }

    let files;
    try {
        files = await PM.getProjectFiles(userId, projectName);
        if (!files) {
            return res.status(400).json({ error: 'Project does not exist' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to get project files' });
    }
    let hostProjectPath;
    try {
        hostProjectPath = path.join(baseDir, userId, projectName);
        await fs.promises.mkdir(hostProjectPath, { recursive: true });
        console.log('hostProjectPath', hostProjectPath)

        for (const [filePath, fileContent] of Object.entries(files)) {
            const newPath = path.join(hostProjectPath, filePath);
            console.log('newPath', newPath)
            await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
            await fs.promises.writeFile(newPath, fileContent['content'] || '');
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create project' });
    }

    try { // need to handle case where there is no requirements.txt
        if (!hostProjectPath) { return res.status(500).json({ error: 'Failed to create execution environment' }); }
        const command = ['bash', '-c',
            `pip install --user -r /home/appuser/${projectName}/requirements.txt && tail -f /dev/null`]

        const container = await docker.createContainer({
            Image: 'python-project',
            AttachStdout: true,
            AttachStderr: true,
            User: 'appuser',
            Tty: true,
            Cmd: command,
            WorkingDir: '/home/appuser',
            HostConfig: {
                Binds: [`${hostProjectPath}:/home/appuser/${projectName}`]
            }
        });

        await container.start();
        containerActivity[container.id] = Date.now();
        return res.json({ container_id: container.id });
    } catch (error) {
        console.error(error);

        return res.status(500).json({ error: 'Failed to create execution environment' });
    }
});

app.get('/execute', (req, res) => {
    const containerId = req.query.containerId;
    const filepath = req.query.filepath;
    const container = docker.getContainer(containerId);
    const command = ['python', '-u', `./${filepath}`];

    containerActivity[container.id] = Date.now();
    // SSE Setup
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    container.exec({Cmd: command, AttachStdout: true, AttachStderr: true, Stream: true}, (err, exec) => {
        if (err) {
            return console.log(err);
        }

        exec.start((err, stream) => {
            if (err) {
                return console.log(err);
            }

            // Stream the output
            stream.on('data', (data) => {
                let output = data.toString('utf8');
                // Replace newline characters "\\n" and tab characters "\\t"
                let encodedOutput = output.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
                res.write(`data: ${encodedOutput}\n\n`); // SSE data format
            });

            stream.on('end', () => {
                // After the data stream has ended
                res.write('event: DONE\n');
                res.end();
            });
        });
    });
});



app.put('/projects/:projectName/files', upload.single('file'), async (req, res) => {
    if (!req.file || !req.body.userId || !req.params.projectName || !req.body.filePath) {
        return res.status(400).json({ message: "One or more request arguments are missing" });
    }
    const containerId = req.body.containerId
    if (containerId) {
        containerActivity[containerId] = Date.now();
    }
    const { originalname: name, path: tempPath } = req.file;
    const { projectName } = req.params;
    let { filePath, userId } = req.body;
    filePath = path.normalize(filePath).replace(/^(\.\.(\/|\\|$))+/, '');
    userId = path.normalize(userId).replace(/^(\.\.(\/|\\|$))+/, '');

    const hostFilePath = path.join(userId, filePath);
    const dir = path.dirname(hostFilePath);

    // Check if directory exists and create if it doesn't
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    // Move the temporary file to the desired location
    try {
        await fs.promises.rename(tempPath, hostFilePath);
        return res.status(200).json({ message: "File uploaded successfully", name, filePath, userId, projectName });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error occurred while moving file" });
    }
});


app.delete('/containers/:containerId', async (req, res) => {
    const containerId = req.params.containerId;

    try {
        const container = docker.getContainer(containerId);
        await container.stop();
        await container.remove();

        res.json({ status: 'success' });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: "Invalid container ID" });
    }
});


const port = process.env.PORT || 3003;
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});


setInterval(async () => {
    const cutoffTime = Date.now() - 30*60*1000;  // 30 minutes ago

    for (let [containerId, lastActivityTime] of Object.entries(containerActivity)) {
        if (lastActivityTime < cutoffTime) {
            // This container hasn't been active in over an hour; stop and remove it
            const container = docker.getContainer(containerId);

            try {
                await container.stop();
                await container.remove();
            } catch (err) {
                console.error(`Failed to stop and remove container ${containerId}:`, err);
            }

            delete containerActivity[containerId];
        }
    }
}, 30*60*1000);  // Run the job every 30 minutes