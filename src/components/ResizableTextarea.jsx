import React, { useRef, useState, useEffect } from 'react';
import './style/textArea.css'


const ResizableTextArea = ({ inputValue, setInputValue, handleSubmit, returnHeight }) => {
	const textAreaRef = useRef();
	const [cols, setCols] = useState(70);
	const [rows, setRows] = useState(1);
	const [numNewLines, setNumNewLines] = useState(0);

	// pass height back to parent to resize output box
	useEffect(() => {
		returnHeight((rows) * 20)  // each new row is 20px
	}, [rows])

	useEffect(() => {
		// update rows
		const textLength = inputValue.length;
		const newRows = Math.ceil((textLength) / cols);
		setRows(Math.max(Math.min(newRows + numNewLines, 10), 1));
	}, [inputValue, cols, rows, numNewLines]);

	// calculate cols based on the parent width and the width of a character
	useEffect(() => {
		if (!textAreaRef.current || (textAreaRef.current && !textAreaRef.current.parentElement)) return;

		const parentElement = textAreaRef.current.parentElement;

		const handleResize = () => {
			const parentWidth = parentElement.offsetWidth;
			const style = window.getComputedStyle(textAreaRef.current);
			const fontSize = parseFloat(style.fontSize);
			setCols(Math.floor(parentWidth / (fontSize * 0.7)));
		};

		// initialize a ResizeObserver
		const ro = new ResizeObserver(handleResize);

		// start observing the parent element
		ro.observe(parentElement);

		// Run the resize handler once to initialize cols
		handleResize();

		return () => {
			// stop observing on cleanup
			ro.disconnect();
		};
	}, []);


	const handleKeyDown = (event) => {
		if (event.key === 'Enter' && !event.shiftKey) {
			event.preventDefault();
			// Add newline on 'Enter'
			setInputValue((currentValue) => {
				setNumNewLines((currentValue) => currentValue + 1);
				return `${currentValue}\n`
			});

		} else if (event.key === "Enter" && event.shiftKey) {
			event.preventDefault();
			handleSubmit();
		}else if (event.key === 'Backspace') {
			// Count the number of newline characters in the inputValue
			const newlineCount = (inputValue.match(/\n/g) || []).length;
			setNumNewLines(newlineCount);
		}else{

		}

	}
	return (
		<textarea
			className={"prompt-area"}
			ref={textAreaRef}
			onKeyDown={(e) => handleKeyDown(e)}
			value={inputValue}
			onChange={(e) => setInputValue(e.target.value)}
			rows={rows || 1}
			cols={cols}
			placeholder={"Type your prompt here..."}
			style={{
				resize: 'none',
				overflowY: 'auto',
				backgroundColor: "#1e1e1e",
				border: "none",
				color: "whitesmoke",
				fontFamily: "Fira Code",
				width: `${cols}ch`,
			}}
		/>
	);
};

export default ResizableTextArea;
