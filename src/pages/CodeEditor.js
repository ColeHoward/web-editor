// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import AceEditor from 'react-ace';
// import ContextMenu from '../components/ContextMenu';
// import "ace-builds/src-noconflict/mode-html";
// import "ace-builds/src-noconflict/mode-python";
// import "ace-builds/src-noconflict/theme-monokai";
// import "ace-builds/src-noconflict/theme-cobalt";
//
// import '../App.css';
// import './style/CodeEditorStyle.css'
// import askGPT from '../utilities/api.js';
// import PromptBox from '../components/PromptBox.jsx';
// import { insertCode, formatCode } from '../utilities/utils.js';
// import DOMPurify from 'dompurify';
// import { debounce } from 'lodash';
// import PythonConsole from "../components/PythonConsole";
// import TestComponent from "../TestComponent";
//
// function CodeEditor({theme, language}) {
// 	const leftPanel = useRef(null);
// 	const rightPanel = useRef(null);
// 	const divider = useRef(null);
// 	let dragging = null;
//
// 	const onMouseDown = useCallback((e) => {
// 		console.log('onMouseDown triggered');
// 		dragging = {
// 			e: e,
// 			leftWidth: leftPanel.current.offsetWidth,
// 			rightWidth: rightPanel.current.offsetWidth
// 		};
// 		document.onmousemove = onMouseMove;
// 		document.onmouseup = () => {
// 			document.onmousemove = document.onmouseup = dragging = null;
// 		};
// 	}, []);
//
// 	const onMouseMove = useCallback(
// 		(e) => {
// 			console.log('onMouseMove triggered');
// 			if (dragging) {
// 				let dx = e.clientX - dragging.e.clientX;
// 				leftPanel.current.style.width = dragging.leftWidth + dx + "px";
// 				rightPanel.current.style.width = dragging.rightWidth - dx + "px";
// 			}
// 		},
// 		[]
// 	);
//
// 	/* ************************ HANDLE RESIZING PANELS ************************ */
// 	const [isResizing, setIsResizing] = useState(false);
//
//
// 	const [editorPanelWidth, setEditorPanelWidth] = useState(window.innerWidth / 2);
// 	const [renderPanelWidth, setRenderPanelWidth] = useState(window.innerWidth / 2);
//
// 	const handleMouseMove = useCallback(
// 		(e) => {
// 			console.log('handleMouseMove triggered');
// 			if (dragging) {
// 				const newWidth = e.clientX - e.currentTarget.getBoundingClientRect().left;
// 				setEditorPanelWidth(newWidth);
// 				setRenderPanelWidth(window.innerWidth - newWidth);
// 			}
// 		},
// 		[dragging]
// 	);
//
// 	/* ************************ HANDLE CHATGPT SUPPORT ************************ */
// 	const [menuPosition, setMenuPosition] = useState({x: '0px', y: '0px'});
// 	const [showMenu, setShowMenu] = useState(false);
// 	const selectedText = useRef(''); // Using useRef
// 	const editorRef = useRef(null);
//
// 	const handleContextMenu = (event) => {
// 		event.preventDefault();
//
// 		if (editorRef.current) {
// 			const editor = editorRef.current.editor;
// 			selectedText.current = editor.getSelectedText(); // Using the ref
//
// 			setMenuPosition({x: `${event.pageX}px`, y: `${event.pageY}px`});
// 			setShowMenu(true);
// 		}
// 	};
// 	const handleClick = (event) => {
// 		setShowMenu(false);
// 	};
//
// 	// handle gpt suggestion prompt/request
// 	const [promptBoxVisible, setPromptBoxVisible] = useState(false);
//
// 	const handleGPTRequest = async (prompt) => {
// 		console.log('prompt: ', prompt, 'selectedText: ', selectedText.current);
//
// 		let isFirstChunk = true;
// 		let insertionPoint = null;
//
// 		await askGPT(prompt, selectedText.current, async (chunk) => {
// 			console.log("Chunk from GPT-3: ", chunk);
// 			if (editorRef.current) {
// 				const editor = editorRef.current.editor;
// 				const session = editor.getSession();
//
// 				if (isFirstChunk) {
// 					isFirstChunk = false;
// 					const selection = editor.getSelection();
// 					const range = selection.getRange();
// 					session.replace(range, "");
//
// 					insertionPoint = {
// 						row: range.start.row,
// 						column: range.start.column
// 					};
// 				}
// 				if (chunk !== "j7&c#0Y7*O$X@Iz6E59Ix") {
// 					await insertCode(session, chunk, insertionPoint);
// 				} else {
// 					// format code
// 					if (language === 'html') {
// 						let formattedCode = formatCode(session.getDocument().getAllLines().join('\n'));
// 						session.setValue(formattedCode);
// 					}
// 				}
// 			}
// 		})
// 		setPromptBoxVisible(false);
// 	};
// 	const handlePromptSubmit = (inputValue) => {
// 		handleGPTRequest(inputValue);
// 	};
// 	const handlePromptCancel = () => {
// 		setPromptBoxVisible(false);
// 	};
//
// 	/* ************************ HANDLE PROGRAMMING LANGUAGE ************************ */
// 	const codeProcessors = {
// 		html: (code) => DOMPurify.sanitize(code),
// 		python: (code) => code
// 	};
//
// 	/* ************************ HANDLE DEBOUNCING ************************ */
// 	const [code, setCode] = useState('');
// 	const [debouncedCode, setDebouncedCode] = useState(code);
// 	const codeProcessor = codeProcessors[language];
// 	let processedCode = codeProcessor(code);
//
// 	const updateDebouncedCode = useCallback(debounce(setDebouncedCode, 500), []);
// 	// Use an effect to update the debounced HTML when the HTML changes
// 	useEffect(() => {
// 		console.log('useEffect triggered');
// 		updateDebouncedCode(code);
// 	}, [code, updateDebouncedCode]);
//
//
// 	// Create an onResize function that adjusts the width of the panels
// 	const onResize = (event, { element, size, handle }) => {
// 		setEditorPanelWidth(size.width);
// 		setRenderPanelWidth(window.innerWidth - size.width);
// 	};
// 	const renderPanel = () => {
// 		console.log('renderPanel triggered');
// 		if (language === 'html') {
// 			return (
// 				<iframe
// 					srcDoc={debouncedCode}
// 					style={{
// 						height: '100%',
// 						border: 'none',
// 						overflowY: 'auto'
// 					}}
// 				/>
// 			);
// 		} else if (language === 'python') {
// 			return (
// 				<PythonConsole
// 					pythonCode={code}
// 					style={{height: '100%'}}
// 				/>
// 			);
// 		} else {
// 			// Default to an empty panel for unsupported languages
// 			return (
// 				<div
// 					style={{
// 						height: '100%',
// 						border: 'none',
// 						overflowY: 'auto'
// 					}}
// 				/>
// 			);
// 		}
// 	};
//
// 	return (
// 		<div
// 			style={{
// 				position: 'relative',
// 				display: 'flex',
// 				height: '100vh',
// 				userSelect: 'none',
// 			}}
// 			onClick={handleClick}
// 		>
// 			{isResizing &&
// 				<div className="resize-overlay" style={{}}/>
// 			}
// 			<PromptBox
// 				isVisible={promptBoxVisible}
// 				onSubmit={handlePromptSubmit}
// 				onCancel={handlePromptCancel}
// 			/>
// 			<div
// 				ref={leftPanel}
// 				className="aceEditorWrapper"
// 				onContextMenu={handleContextMenu}
// 				style={{
// 					flex: '1'
// 				}}
// 			>
// 				{showMenu && (
// 					<ContextMenu menuPosition={menuPosition} setPromptBoxVisible={setPromptBoxVisible}/>
// 				)}
// 				<AceEditor
// 					ref={editorRef}
// 					mode={language}
// 					theme={theme}
// 					onChange={setCode}  // this updates the code whenever the user types
// 					name="UNIQUE_ID_OF_DIV"
// 					editorProps={{$blockScrolling: true}}
// 					value={code}  // this sets the code editor's initial value
// 					width="100%"
// 					height="100%"
// 					setOptions={{
// 						wrap: true
// 					}}
// 				/>
// 			</div>
// 			<div onMouseDown={onMouseDown} className="divider"> {/* temporary border for debugging */}
// 			</div>
// 			<div ref={rightPanel} style={{flex: '1', width: "5px"}}>
// 				{renderPanel()}
// 			</div>
// 		</div>
// 	);
// };
//
// export default CodeEditor;
