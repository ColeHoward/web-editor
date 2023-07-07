import React, {useState} from 'react';
import { Box, Typography, Card } from '@mui/material';
import ResizableTextArea from "./ResizableTextarea";
import {chatGPT} from "../utilities/api";
import CodeBlock from "./CodeBlock";
import SendIcon from "./icons/SendIcon"

const ChatPanel = ({selectedText, messages, setMessages, currWidth}) => {
	const [inputValue, setInputValue] = useState('');
	const [textAreaHeight, setTextAreaHeight] = useState(20);

	const handleSubmit =  () => {
		// Don't submit if inputValue is only whitespace
		if (!inputValue.trim()) return;
		// Add a new message to the messages array.
		setMessages(prevMessages => [...prevMessages, { text: inputValue.trim(), from: 'user' }]);
		handleGPTRequest(inputValue.trim());
		// Clear the input field.
		setInputValue('');
	}

	/****************************************** HANDLE STANDARD CHAT W/GPT *******************************************/
	const handleGPTRequest = async (prompt) => {
		let gptMessageIndex = null;
		await chatGPT(prompt, selectedText ?? "", async (chunk) => {
			if (chunk !== "j7&c#0Y7*O$X@Iz6E59Ix") {
				setMessages(prevMessages => {
					if(gptMessageIndex !== null && prevMessages[gptMessageIndex] && 'text' in prevMessages[gptMessageIndex]) {
						// If a 'gpt' message already exists, append the new chunk to it
						return prevMessages.map((message, index) =>
							index === gptMessageIndex ? {...message, text: message.text + chunk} : message);
					} else {
						// If there's no 'gpt' message, create a new one and keep track of its index
						const newMessage = { text: chunk, from: 'gpt' };
						gptMessageIndex = prevMessages.length;
						return [...prevMessages, newMessage];
					}
				});
			}
		});
	};

	return (
		<Box sx={{ display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 48px)', alignItems: 'center', fontSize: "13px", padding: "0 0 10px 0",
			justifyContent: "flex-start", width: "100%"}}>
			<Box className={"prompt-response"} sx={{ display: 'block', flexDirection: 'column', height: `calc(90vh - 12px - ${textAreaHeight}px)`, width: '100%', overflow: 'auto',
				p: 1, border: 1, borderColor: 'divider', borderBottomLeftRadius: '5px' , borderBottomRightRadius: '5px', alignItems: "flex-start", padding: "10px 0px 10px 0px", justifyContent: "flex-start",
				backgroundColor: "#1e1e1e", overflowY: "auto"}}>
				{messages.map((message, index) => {
					const chunks = message.text.split("```");
					let codeBlockOpen = false;
					return (
						<Card variant="outlined"
							  sx={{
								  bgcolor: message.from === 'user' ? 'rgba(255, 255, 255, 0.06);': '#1e1e1e',
								  width: "100%",
								  textAlign: "left",
								  padding: message.from === 'user' ? "5px 10px" : "5px 20px",
								  border: "none",
								  borderRadius: "0",
								  margin: "10px 0",
							  }}>
							{chunks.map(chunk => {
								if (codeBlockOpen) {
									codeBlockOpen = false;
									const lines = chunk.split('\n');
									const language = lines[0];  // The first line is the language
									const code = lines.slice(1).join('\n');  // The rest is the code
									return <CodeBlock language={language} code={code} />
								} else {
									codeBlockOpen = true;
									return (
										<Typography variant="body1" color={message.from === 'user' ? 'whitesmoke': 'whitesmoke'}
													style={{
														padding: "5px",
														whiteSpace: 'pre-wrap',
														wordWrap: "break-word",
														fontSize: "15px",
														lineHeight: "1.7",
														fontWeight: message.from === 'user' ? "bold" : "normal",
													}}>
											{chunk}
										</Typography>
									);
								}
							})}
						</Card>
					);
				})}
			</Box>
			<Box component="form"
				 onSubmit={event => { event.preventDefault(); handleSubmit(); }}
				 sx={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-end', mt: 2, justifyContent: "space-between", wordWrap: ""}}
				 style={{backgroundColor: "#1e1e1e", padding: "10px 20px", borderRadius: "5px", width: '100%'}}
			>
				<ResizableTextArea style={{marginRight: "10px", fontFamily: "Fira Code"}} numCols={70} returnHeight={(height) => setTextAreaHeight(height + 20)}
								   inputValue={inputValue} setInputValue={setInputValue} handleSubmit={handleSubmit}
									width={currWidth}
				/>
				<SendIcon type="submit" onClick={handleSubmit}
						  style={{ width: "20px", height: "20px", minWidth: "20px", flexGrow: "1", cursor: "pointer"}}
						  title="Shift+Enter" idSuffix="chatPanel"/>
			</Box>
		</Box>
	)
}


export default ChatPanel;


