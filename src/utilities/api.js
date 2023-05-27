const { SSE } = require('sse.js');


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
