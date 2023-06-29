import React, { useRef, useState, useEffect } from 'react';
import './style/textArea.css'


const ResizableTextArea = ({inputValue, setInputValue, handleSubmit, returnHeight, width, placeholder }) => {
	const textAreaRef = useRef();
	const [cols, setCols] = useState(width / (14 * 0.6));

	useEffect(() => {
		if (!textAreaRef.current) return;
		textAreaRef.current.style.height = "0";
		const scrollHeight = textAreaRef.current.scrollHeight;
		const newHeight = inputValue ? Math.max(Math.min(scrollHeight, 20*8), 20) : 20;
		returnHeight(newHeight);  // Call this first
		textAreaRef.current.style.height = newHeight + "px";
	}, [inputValue]);


	useEffect(() => {
		if (!textAreaRef.current) return;
		const style = window.getComputedStyle(textAreaRef.current);
		const fontSize = parseFloat(style.fontSize);
		setCols(Math.floor(width / (fontSize * 0.6)));  // is there a better way to do this?
	}, [width]);

	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			setInputValue((currentValue) => `${currentValue}\n`);
		} else if (event.key === "Enter" && event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}
	}

	return (
		<textarea
			className={"prompt-area"}
			ref={textAreaRef}
			onKeyDown={handleKeyDown}
			onChange={(e) => {
				setInputValue(e.target.value);
			}}
			value={inputValue}
			rows={1}
			placeholder={placeholder ?? "Type your prompt here..."}
			style={{
				resize: 'none',
				overflowY: 'auto',
				backgroundColor: "#1e1e1e",
				border: "none",
				color: "whitesmoke",
				fontFamily: "Fira Code",
				width: `${cols}ch`,
				lineHeight: "20px",
				height: "20px !important",
				padding: '0',  // Add this line
			}}
		/>
	);
};

export default ResizableTextArea;
