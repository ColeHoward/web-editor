import {buildMetaData} from "./utils";
const { SSE } = require('sse.js');


export async function chatGPT(prompt, context, onChunk) {
    const url = `http://localhost:3001/chat?prompt=${encodeURIComponent(prompt)}&context=${encodeURIComponent(context)}`;
    try {
        const source = new SSE(url);

        source.addEventListener('message', function(e) {
            const parsed = JSON.parse(e.data)
            onChunk(parsed.data);
        });

        source.addEventListener('DONE', function(e) {
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

export async function getProjectMetaData(userId, projectId) {

    return fetch(`http://localhost:3002/get-project-metadata?userId=${userId}&projectId=${projectId}`)
        .then(res => res.json())
        .then(data => buildMetaData(data))
        .catch(err => {
            console.log('get project metadata error:', err)
            return {fileMetaData: {}, projectTree: {}};
        });
}

export async function setupEnv(userId, projectName) {
    console.log('setting up env for project:', projectName, 'and user:', userId);
    return fetch(`http://localhost:3003/projects/${projectName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({userId: userId})
    }).then(res => res.json())
        .then(data => {
            console.log('setup env response:', data);
            return data.container_id;
        })
        .catch(err => {return {container_id: null}});
}

export async function updateS3File(fileContent, fileName, language, userId='Cole', projectId='testProject') {
    const formData = new FormData();
    const file = new Blob([fileContent], {type : "text/plain"});
    formData.append('userId', userId);
    formData.append('filename', fileName)
    formData.append('file', file);
    formData.append('projectId', projectId);
    formData.append('language', language);

    return fetch('http://localhost:3002/put-file', {
        method: 'PUT',
        body: formData
    }).then(res => res.json())
        .then(data => {
            return data;
        })
        .catch(err => console.log('file update error:', err));
}

export  function updateFile(fileContent, fileName, userId='Cole', projectId='testProject') {
    const formData = new FormData();
    //     if (!req.file || !req.body.userId || !req.params.projectName || !req.body.filePath) {
    const file = new Blob([fileContent], {type : "text/plain"});
    formData.append('file', file);
    formData.append('userId', userId);
    formData.append('filePath', fileName);

    return fetch(`http://localhost:3003/projects/${projectId}/files`, {
        method: "PUT",
        body: formData
    }).catch(err => console.log('file update error:', err));
}


