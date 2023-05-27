const apiKey = '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';
const port = 3001;
const axios = require('axios');
const express = require('express');
const app = express();
const cors = require('cors');


app.use(cors());
app.get('/query', async function (req, res) {
    let fullResponse = ""
    try {
        let {context, prompt} = req.query;
        prompt += ". You should only respond with code, no other words or labels.";
        prompt += "Here is the code being referred to: \n" + context;

        try {
            const response = await axios({
                method: 'post',
                url: 'https://api.openai.com/v1/chat/completions',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`,
                },
                data: {
                    'model': 'gpt-3.5-turbo',
                    'messages': [
                        {
                            'role': 'system',
                            'content': 'You are a helpful coding assistant. Your job is to change code given to you' +
                                'based on the prompt also given to you. You should only respond with the new version' +
                                ' of the code, no other words, instructions, or labels.'
                        },
                        {
                            'role': 'user',
                            'content': prompt
                        }
                    ],
                    'max_tokens': 500,
                    'stream': true,
                },
                responseType: 'stream'
            });

            // Set necessary headers for Server-Sent Events
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            let responseBody = '';
            response.data.on('data', (chunk) => {
                responseBody += chunk.toString();
                let separatorIndex;
                while ((separatorIndex = responseBody.indexOf('\n')) >= 0) {
                    const chunkLine = responseBody.slice(0, separatorIndex);
                    responseBody = responseBody.slice(separatorIndex + 1);
                    let parsedData;
                    try {
                        const formattedChunk = "{" + '"' + chunkLine.slice(0, 4) + '"' + chunkLine.slice(4) + "}";
                        parsedData = JSON.parse(formattedChunk);
                    } catch (e) {
                        // If the chunk cannot be parsed, it might be incomplete, so we will wait for more data
                        break;
                    }
                    if (parsedData.data.choices && parsedData.data.choices[0].delta && parsedData.data.choices[0].delta.content
                    && parsedData.data.choices[0].delta.content !== "") {
                        let contentData = parsedData.data.choices[0].delta.content;

                        // remove ``` from string
                        contentData = contentData.replace(/```/g, "");
                        if (contentData.slice(0, 5) === "html") {
                            contentData = contentData.slice(5);
                        }
                        fullResponse += contentData;
                        let res_data = `event: message\ndata: {"data": ${JSON.stringify(contentData)}}\n\n`
                        console.log('res_data', res_data)
                        res.write(res_data);
                    }
                }
            });

            response.data.on('end', () => {
                res.write('event: DONE\ndata: {"data": "stream finished"}\n\n');
                res.end();
                console.log('full response', fullResponse)
            });
        } catch (error) {
            console.error(`Request failed: ${error}`);
        }
    } catch (error){
        res.status(500).send('An error occurred while processing your request.');
    }
});




app.listen(port,async function () {
    // await handleSpotifyToken()
    console.log(`Server listening on port ${port}`);
});




