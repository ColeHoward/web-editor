import React, { useState, useCallback, useRef, useEffect } from 'react';
import '../App.css';
import PythonConsole from "../components/PythonConsole";
import { styled } from "@stitches/react";
import TestComponent from "../TestComponent";
import PromptBox from "../components/PromptBox";
import askGPT from "../utilities/api";
import {formatCode, insertCode} from "../utilities/utils";
import ContextMenu from "../components/ContextMenu";
import 'bootstrap/dist/css/bootstrap.min.css';
import './style/developmentPage.css'
import {HtmlRenderer} from "../components/HtmlRenderer";
import SimpleBar from 'simplebar-react';
import {debounce} from "lodash";


// eventually need to just make these CSS classes
const Wrapper = styled("div", {
	height: "100%",
	width: "100%",
	position: "relative",
	display: "flex",
	justifyContent: "space-between",
	variants: {
		isResizing: {
			true: {
				cursor: "col-resize"
			}
		}
	}
});

const Box = styled("div", {
	position: "relative",
	height: "100%",
	width: "100%",
	// padding: "1rem",
	overflowY: "hidden",
	// hide scrollbar

});

const Divider = styled("div", {
	position: "relative",
	height: "100%",
	"&:after": {
		content: "",
		position: "absolute",
		top: 0,
		bottom: 0,
		left: "-3px",
		width: "6px",
		// background: "transparent",
		cursor: "col-resize",
		// transiton: "all 50ms",
		zIndex: 100
	},

	"&:hover": {
		"&:after": {
			background: "purple"
		}
	},
	"&:active": {
		"&:after": {
			background: "purple"
		}
	},

	variants: {
		active: {
			true: {
				"&:after": {
					background: "red !important"
				}
			}
		}
	}
});

function Panel({ children, width }) {
	return (
		<Box css={{ width: width ? `${width}px` : "100%" }}>
			{children}
		</Box>
	);
}


export function DevelopmentPage({language}) {
	/* ************************ HANDLE PANEL RESIZING ************************ */
	const [panelWidths, setPanelWidths] = useState({leftWidth: window.innerWidth / 2,
															  rightWidth: window.innerWidth / 2});
	const [code, setCode] = useState('');

	const onMouseDown = useCallback((e) => {
		const shield = document.createElement('div');
		shield.style.position = 'absolute';
		shield.style.top = '0';
		shield.style.left = '0';
		shield.style.width = '100%';
		shield.style.height = '100%';
		shield.style.zIndex = '9999'; // This should be higher than the z-index of your iframe
		shield.id = 'drag-shield';  // So you can find it later
		document.body.appendChild(shield);

		const onMove = (e) => {
			const { movementX } = e;
			setPanelWidths((prevWidths) => {
				const newLeftWidth = prevWidths.leftWidth + movementX;
				const newRightWidth = prevWidths.rightWidth - movementX;
				return { leftWidth: newLeftWidth, rightWidth: newRightWidth };
			});
		};

		const onMouseUp = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseUp);
			const shield = document.getElementById('drag-shield');
			if (shield) {
				shield.remove();
			}
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);
	}, []);


	/* ************************ HANDLE CONTEXT MENU ************************ */
	const [menuPosition, setMenuPosition] = useState({x: '0px', y: '0px'});
	const [showMenu, setShowMenu] = useState(false);
	const selectedText = useRef(''); // Using useRef
	const editorRef = useRef(null);

	const handleContextMenu = (event) => {
		event.preventDefault();

		if (editorRef.current) {
			const editor = editorRef.current;
			const selection = editor.state.selection.main;
			const doc = editor.state.doc;

			const low = Math.min(selection.from, selection.to)
			const high = Math.max(selection.from, selection.to)
			// Getting the selected text
			selectedText.current = doc.sliceString(low, high);

			setMenuPosition({ x: `${event.pageX}px`, y: `${event.pageY}px` });
			setShowMenu(true);
		}
	};

	/* ************************ HANDLE CHATGPT SUPPORT ************************ */
	const [promptBoxVisible, setPromptBoxVisible] = useState(false);

	const handleGPTRequest = async (prompt) => {
		let isFirstChunk = true;
		let originalSelection;

		if (editorRef.current) {
			originalSelection = editorRef.current.state.selection.main;
		}
		await askGPT(prompt, selectedText.current, async (chunk) => {
			if (editorRef.current) {
				const editor = editorRef.current;
				if (chunk !== "j7&c#0Y7*O$X@Iz6E59Ix") {
					if (isFirstChunk) {
						isFirstChunk = false;
						originalSelection.to = insertCode(editor, chunk, true, originalSelection.from,
														  originalSelection.to);
					} else {
						originalSelection.from = originalSelection.to;
						originalSelection.to = insertCode(editor, chunk, false, originalSelection.from);
					}
				}
			}
		})
		setPromptBoxVisible(false);
	};
	// useEffect(() => {
	// 	console.log('code changed', code)
	// }, [code])
	const handlePromptSubmit = (inputValue) => {
		handleGPTRequest(inputValue);
	};

	const handlePromptCancel = () => {
		setPromptBoxVisible(false);
	};

	/* ************************ HANDLE CODE OUTPUT PANEL ************************ */
	const outputPanel = () => {
		if (language === "python") {
			return (
				<PythonConsole pythonCode={code} className={"bg-dark"} />
			)
		}else if (language === "html") {
			return (
				<HtmlRenderer code={debouncedCode} className={"bg-dark"} />
			)
		}
	}
	/* ************************ HANDLE DEBOUNCING ************************ */
	const [debouncedCode, setDebouncedCode] = useState(code);
	const updateDebouncedCode = useCallback(debounce(setDebouncedCode, 500), []);
	// Use an effect to update the debounced HTML when the HTML changes
	useEffect(() => {
		console.log('useEffect triggered');
		updateDebouncedCode(code);
	}, [code, updateDebouncedCode]);

	return (
		<Wrapper css={{ height: "100vh" }}>
			<PromptBox
				isVisible={promptBoxVisible}
				onSubmit={handlePromptSubmit}
				onCancel={handlePromptCancel}
			/>
			<Panel id={"code-mirror-container"} width={panelWidths.leftWidth} >
				{showMenu && (
					<ContextMenu menuPosition={menuPosition} setPromptBoxVisible={setPromptBoxVisible}
					onClick={() => setShowMenu(false)} setShowMenu={setShowMenu} showMenu={showMenu}/>
				)}
				<TestComponent code={code} setCode={setCode} language={language} editorRef={editorRef}
								handleContextMenu={handleContextMenu}
				/>
			</Panel>
			<Divider onMouseDown={onMouseDown} />
			<Panel width={panelWidths.rightWidth}>
				{outputPanel()}
			</Panel>
		</Wrapper>
	);
}
