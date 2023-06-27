import React, {useState} from 'react';
import { Box, Typography, Card } from '@mui/material';
import ResizableTextArea from "./ResizableTextarea";
import {ReactComponent as SendIcon} from "../assets/icons/send.svg";
import {chatGPT} from "../utilities/api";
import CodeBlock from "./CodeBlock";

const ChatPanel = ({selectedText, messages, setMessages}) => {
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
		<Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', alignItems: 'center', fontSize: "13px", padding: "0 0 10px 0",
			justifyContent: "flex-start", width: "97.5%"}}>
			<Box sx={{ display: 'block', flexDirection: 'column', height: `calc(90% - 26px - ${textAreaHeight}px)`, width: '100%', overflow: 'auto',
				p: 1, border: 1, borderColor: 'divider', borderRadius: 1, alignItems: "flex-start", padding: "10px 10px 10px 10px", justifyContent: "flex-start",
				backgroundColor: "#1e1e1e", overflowY: "auto"}}>
				{messages.map((message, index) => {
					const chunks = message.text.split("```");
					let codeBlockOpen = false;
					return (
						<Card variant="outlined"
							  sx={{
								  bgcolor: message.from === 'user' ? '#1A1A1A;': '#1e1e1e',
								  width: "100%",
								  textAlign: "left",
								  padding: message.from === 'user' ? "5px 10px" : "5px 20px",
								  border: "none",
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
										<Typography variant="body1" color="whitesmoke"
													style={{
														padding: "5px",
														whiteSpace: 'pre-wrap',
														wordWrap: "break-word",
														fontSize: "15px",
														lineHeight: "1.7"
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
				 sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', mt: 2, justifyContent: "space-between", wordWrap: ""}}
				 style={{backgroundColor: "#1e1e1e", padding: "10px 20px", borderRadius: "5px", width: '100%'}}
			>
				<ResizableTextArea style={{marginRight: "10px", fontFamily: "Fira Code"}} numCols={70} returnHeight={setTextAreaHeight}
								   inputValue={inputValue} setInputValue={setInputValue} handleSubmit={handleSubmit}/>
				<SendIcon type="submit" onClick={handleSubmit}
						  style={{ color: "gray", width: "20px", height: "20px", flexGrow: "0", cursor: "pointer"}}
						  title="Shift+Enter"/>
			</Box>
		</Box>
	)
}


export default ChatPanel;


