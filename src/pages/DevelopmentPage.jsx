import React, { useState, useCallback, useRef, useEffect } from 'react';
import '../components/style/tabbedStyle.css'
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../pages/style/developmentPage.css'
import PythonConsole from "../components/PythonConsole";
import PromptBox from "../components/PromptBox";
import askGPT from "../utilities/api";
import ContextMenu from "../components/ContextMenu";
import {insertCode} from "../utilities/utils";
import {HtmlRenderer} from "../components/HtmlRenderer";
import {Divider} from "../components/Divider";
import Panel from "../components/Panel";
import Sidebar from "../components/Sidebar";
import TabbedEditor from "../components/TabbedEditor";
import TestComponent from "../TestComponent";
import ResizableTextArea from "../components/ResizableTextarea";
import TabbedHelper from "../components/TabbedHelper";


export function DevelopmentPage({language, userId, projectId, projectFiles, setProjectFiles, projectTree}) {

	/******************************************* HANDLE PANEL RESIZING *******************************************/
	const [panelWidths, setPanelWidths] = useState({
			leftWidth: (window.innerWidth-40) / 2, // -40 to account for sidebar
			rightWidth: (window.innerWidth-40) / 2
	});
	const [code, setCode] = useState('');

	const onMouseDown = useCallback((e) => {
		if (language === "html") {
			// put shield over iframe so resizing works
			const shield = document.createElement('div');
			shield.id = 'drag-shield';  // So you can find it later
			document.body.appendChild(shield);
		}

		const onMove = (e) => {
			e.preventDefault() // prevent text selection when resizing
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
			if (language === "html") {
				const shield = document.getElementById('drag-shield');
				if (shield) {
					shield.remove();
				}
			}
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);
	}, []);


	/******************************************* HANDLE CONTEXT MENU *******************************************/
	const [menuPosition, setMenuPosition] = useState({x: '0px', y: '0px'});
	const [showMenu, setShowMenu] = useState(false);
	const selectedText = useRef(''); // Using useRef
	const editorRef = useRef(null);

	const handleContextMenu = (event) => {
		console.log('in handle context menu')
		event.preventDefault();

		if (editorRef.current) {
			console.log('editor not null')
			const editor = editorRef.current;
			const selection = editor.state.selection.main;
			const doc = editor.state.doc;

			const low = Math.min(selection.from, selection.to)
			const high = Math.max(selection.from, selection.to)
			// Getting the selected text
			selectedText.current = doc.sliceString(low, high);

			setMenuPosition({ x: `${event.pageX}px`, y: `${event.pageY}px` });
			setShowMenu(true);
		}else {
			console.log('editor is null')
		}
	};

	/****************************************** HANDLE CHAT GPT SUPPORT *******************************************/
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
	const handlePromptSubmit = (inputValue) => {
		handleGPTRequest(inputValue);
	};

	const handlePromptCancel = () => {
		setPromptBoxVisible(false);
	};

	/************************************** HANDLE OPENING AND CLOSING FILES **************************************/
	async function getFileContent(s3_key) {
		const response = await fetch('http://localhost:3002/get-file/?s3_key=' + encodeURIComponent(s3_key));
		return response.text();
	}
	const [files, setFiles] = useState(projectFiles);  // only used to save file changes in state
	useEffect(() => {
		setFiles(projectFiles);
	}, [projectFiles]);
	async function openFile(fileName) {
		setFiles((prevFiles) => {
			// If the file is already opened before, just set isOpen to true
			if (fileName in prevFiles && 'content' in prevFiles[fileName]) {
				if (prevFiles[fileName].isOpen === true) {
					return prevFiles;
				}
				// Note: never update state directly, always return a new object (can lead to weird bugs)
				return {
					...prevFiles,
					[fileName]: {
						...prevFiles[fileName],
						isOpen: true,
					}
				}
			} else {
				// If the file content hasn't been loaded before, get it now
				// Note: This is an async operation, but we can't wait for it (state updates are synchronous)
				getFileContent(prevFiles[fileName].s3_key).then((content) => {
					setFiles({
						...prevFiles,
						[fileName]: {
							...prevFiles[fileName],
							content: content,
							isOpen: true,
						},
					});
				});
				// Return previous state immediately
				return prevFiles;
			}
		});
	}

	// TODO if new file is added, add new object to files and set to open
	return (
		<div className={'wrapper'} >
			<Sidebar style={{overflow: "hidden"}} openFile={openFile} projectTree={projectTree} ></Sidebar>
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
				<TabbedEditor code={code} setCode={setCode} language={language} editorRef={editorRef}
							  handleContextMenu={handleContextMenu} files={files} setFiles={setFiles} userId={userId}
							  projectId={projectId} projectTree={projectTree}
				/>
			</Panel>
			<Divider onMouseDown={onMouseDown} style={{margin: "0 auto"}} />
			<Panel width={panelWidths.rightWidth}>
				<TabbedHelper language={language} code={code}/>
			</Panel>
		</div>
	);
}


