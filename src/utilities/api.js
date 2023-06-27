const { SSE } = require('sse.js');


export async function chatGPT(prompt, context, onChunk) {
    const url = `http://localhost:3001/chat?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}`;

    try {
        const source = new SSE(url);

        source.addEventListener('message', function(e) {
            console.log('Received chunk:', JSON.parse(e.data));
            const parsed = JSON.parse(e.data)
            onChunk(parsed.data);
        });

        source.addEventListener('DONE', function(e) {
            console.log('Stream finished.');
            // pass secret string to indicate that all chunks have been received
            onChunk("j7&c#0Y7*O$X@Iz6E59Ix");
            source.close();
        });
        source.stream();

    } catch (err) {
        console.log('Error:', err);
    }
}


async function askGPT(prompt, context, onChunk) {
    const url = `http://localhost:3001/query?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}`;

    try {
        const source = new SSE(url);

        source.addEventListener('message', function(e) {
            console.log('Received chunk:', JSON.parse(e.data));
            const parsed = JSON.parse(e.data)
            onChunk(parsed.data);
        });

        source.addEventListener('DONE', function(e) {
            console.log('Stream finished.');
            // pass secret string to indicate that all chunks have been received
            onChunk("j7&c#0Y7*O$X@Iz6E59Ix");
            source.close();
        });
        source.stream();

    } catch (err) {
        console.log('Error:', err);
    }
}

export default askGPT;

export async function uploadNewFile(fileContent, fileName, userId, projectId, projectStructure) {
    const formData = new FormData();
    const file = new Blob([fileContent], {type : "text/plain"});
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('projectId', projectId);
    formData.append('s3_key', fileName);
    formData.append('projectStructure', projectStructure);

    return fetch('http://localhost:3002/upload-new-file', {
        method: 'POST',
        body: formData
    }).then(res => res.json())
        .then(data => {
            console.log('file upload response:', data);
            return data;
        })
        .catch(err => console.log('file upload error:', err));
}


// upload file should already handle updating too (put request)
export async function updateFile(fileContent, fileName, userId, projectId) {
    const formData = new FormData();
    const file = new Blob([fileContent], {type : "text/plain"});
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('projectId', projectId);
    formData.append('s3_key', fileName);

    return fetch('http://localhost:3002/update-file', {
        method: 'POST',
        body: formData
    }).then(res => res.json())
        .then(data => {
            console.log('file update response:', data);
            return data;
        })
        .catch(err => console.log('file update error:', err));
}

export async function getProjectMetaData(userId, projectId) {

    return fetch(`http://localhost:3002/get-project-metadata?userId=${userId}&projectId=${projectId}`)
        .then(res => res.json())
        .then(data => buildMetaData(data))
        .catch(err => {
            console.log('get project metadata error:', err)
            return {fileMetaData: {}, projectTree: {}};
        });
}

function buildMetaData(files) {
    if (!files || files.length === 0 || !files[0].SK) {
        console.error('Invalid files data:', files);
        return {fileMetaData: {}, projectTree: {}};
    }
    // project tree only needs to store the path and its children
    // other metadata should be stored in separate dictionary
    let idCounter = 1;
    let projectName = files[0].SK.split('#')[1].replace('_file', '');  // Assuming all files belong to the same project
    let projectTree = { id: idCounter++, name: projectName, children: [] };
    let nodeLookup = { [projectName]: projectTree };
    let fileMetaData = {};

    // iterate through sorted files and create tree
    for (let file of files) {
        let filePath = file.SK.split('#')[2];
        let pathArr = filePath.split('/');

        // create nodes for each directory in path
        let currentPath = projectName;
        for (let dir of pathArr) {
            currentPath += '/' + dir;
            // create new node if it doesn't exist already
            if (!(currentPath in nodeLookup)) {
                let newNode = { id: idCounter++, name: dir, children: [] };
                nodeLookup[currentPath] = newNode;
                nodeLookup[currentPath.slice(0, currentPath.lastIndexOf('/'))].children.push(newNode);
            }
        }
        fileMetaData[currentPath] = {fileLink: file.fileLink, language: file.language, isOpen: false, s3_key: file.s3_key};
    }

    return {fileMetaData: fileMetaData, projectTree: projectTree};
}





