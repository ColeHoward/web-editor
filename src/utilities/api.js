import {buildMetaData} from "./utils";
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






