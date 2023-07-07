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

const http = require('http');
const server = http.createServer(app);
const socketIO = require('socket.io');
const io = socketIO(server);


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

const PM = new ProjectManager(s3, dynamodb, docker, process.env.DYNAMODB_TABLE_NAME, process.env.AWS_S3_BUCKET_NAME, homeDir);

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
        const currPath = process.cwd();
        hostProjectPath = path.join(currPath, userId, projectName);

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
    } catch (error) {
        console.error(error);
        return res.status(500).send("Failed to create Docker container");
    }

    res.send('Project and Docker container created successfully');
});


app.post('/projects/:projectName', async (req, res) => {
    const userId = req.body.userId;
    const projectName = req.params.projectName;
    console.log(req.body, projectName)
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
        hostProjectPath = path.join(process.cwd(), userId, projectName);
        await fs.promises.mkdir(hostProjectPath, { recursive: true });

        for (const [filePath, fileContent] of Object.entries(files)) {
            const newPath = path.join(hostProjectPath, filePath);
            await fs.promises.mkdir(path.dirname(newPath), { recursive: true });
            await fs.promises.writeFile(newPath, fileContent['content']);
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
        return res.json({ container_id: container.id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to create execution environment' });
    }
});

app.get('/execute', (req, res) => {
    const containerId = req.query.containerId;
    const filepath = req.query.filepath;
    console.log(containerId, filepath)
    const container = docker.getContainer(containerId);
    const command = ['python', '-u', `./${filepath}`];

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
                // Replace newline characters "\\n"
                let encodedOutput = output.replace(/\n/g, '\\n');
                res.write(`data: ${encodedOutput}\n\n`); // SSE data format
            });


            stream.on('end', () => {
                // After the data stream has ended
                res.write('event: DONE\n');
                res.end();
                console.log('Stream ended');
            });
        });
    });
});


app.put('/projects/:projectName/files', upload.single('file'), async (req, res) => {
    if (!req.file || !req.body.userId || !req.params.projectName || !req.body.filePath) {
        return res.status(400).json({ message: "One or more request arguments are missing" });
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
        console.log("Directory does not exist. Creating...");
        fs.mkdirSync(dir, { recursive: true });
        console.log("Directory created");
    } else {
        console.log("Directory already exists");
    }


    try {
        const stats = await fs.promises.stat(hostFilePath);
        if (stats.isFile()) {
            console.log("File already exists, it will be overwritten");
        }
    } catch (err) {
        // File does not exist or there was an error checking, continue with writing
        console.log("File does not exist or error occurred while checking, will write new file");
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


app.post('/stop/:containerId', async (req, res) => {
    const containerId = req.params.containerId;

    try {
        const container = docker.getContainer(containerId);
        await container.stop();

        res.json({ status: 'success' });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: "Invalid container ID" });
    }
});

app.post('/delete/:containerId', async (req, res) => {
    const containerId = req.params.containerId;

    try {
        const container = docker.getContainer(containerId);
        await container.remove();

        res.json({ status: 'success' });
    } catch (e) {
        console.error(e);
        res.status(400).json({ message: "Invalid container ID" });
    }
});


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is up and running on port ${port}`);
});
