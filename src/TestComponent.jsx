// import React, { useState, useCallback, useRef, useEffect } from 'react';
// import './components/style/tabbedStyle.css'
// import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';
// import './pages/style/developmentPage.css'
// import PythonConsole from "./components/PythonConsole";
// import PromptBox from "./components/PromptBox";
// import askGPT from "./utilities/api";
// import ContextMenu from "./components/ContextMenu";
// import CodeEditor from "./components/CodeEditor";
// import {insertCode} from "./utilities/utils";
// import {HtmlRenderer} from "./components/HtmlRenderer";
// import {debounce} from "lodash";
// import {Divider} from "./components/Divider";
// import Panel from "./components/Panel";
// import Sidebar from "./components/Sidebar";
// import TabbedEditor from "./components/TabbedEditor";
//
//
//
// let testFiles = {
//     "file.txt": {isOpen: true, content: "this is file 1\n\n\n", language: "python"},
//     "file2.txt": {isOpen: true, content: "this is file 2\n\n\n", language: "python"},
// };
//
//
//
// export function TestComponent({language}) {
//
//     /******************************************* HANDLE PANEL RESIZING *******************************************/
//     const [panelWidths, setPanelWidths] = useState({leftWidth: (window.innerWidth-40) / 2,
//         rightWidth: (window.innerWidth-40) / 2});
//     // What am I using setCode for? I don't think I need it, unless for formatting or chatgpt
//     const [code, setCode] = useState('');
//
//     const onMouseDown = useCallback((e) => {
//         if (language === "html") {
//             // put shield over iframe so resizing works
//             const shield = document.createElement('div');
//             shield.id = 'drag-shield';  // So you can find it later
//             document.body.appendChild(shield);
//         }
//
//         const onMove = (e) => {
//             e.preventDefault() // prevent text selection when resizing
//             const { movementX } = e;
//             setPanelWidths((prevWidths) => {
//                 const newLeftWidth = prevWidths.leftWidth + movementX;
//                 const newRightWidth = prevWidths.rightWidth - movementX;
//                 return { leftWidth: newLeftWidth, rightWidth: newRightWidth };
//             });
//         };
//
//         const onMouseUp = () => {
//             window.removeEventListener('mousemove', onMove);
//             window.removeEventListener('mouseup', onMouseUp);
//             if (language === "html") {
//                 const shield = document.getElementById('drag-shield');
//                 if (shield) {
//                     shield.remove();
//                 }
//             }
//         };
//
//         window.addEventListener('mousemove', onMove);
//         window.addEventListener('mouseup', onMouseUp);
//     }, []);
//
//
//     /******************************************* HANDLE CONTEXT MENU *******************************************/
//     const [menuPosition, setMenuPosition] = useState({x: '0px', y: '0px'});
//     const [showMenu, setShowMenu] = useState(false);
//     const selectedText = useRef(''); // Using useRef
//     const editorRef = useRef(null);
//
//     // TODO need to pass in which editor is being clicked
//     const handleContextMenu = (event) => {
//         console.log('in handle context menu')
//         event.preventDefault();
//
//         if (editorRef.current) {
//             console.log('editor not null')
//             const editor = editorRef.current;
//             const selection = editor.state.selection.main;
//             const doc = editor.state.doc;
//
//             const low = Math.min(selection.from, selection.to)
//             const high = Math.max(selection.from, selection.to)
//             // Getting the selected text
//             selectedText.current = doc.sliceString(low, high);
//
//             setMenuPosition({ x: `${event.pageX}px`, y: `${event.pageY}px` });
//             setShowMenu(true);
//         }else {
//             console.log('editor is null')
//         }
//     };
//
//     /****************************************** HANDLE CHAT GPT SUPPORT *******************************************/
//     const [promptBoxVisible, setPromptBoxVisible] = useState(false);
//     const handleGPTRequest = async (prompt) => {
//         let isFirstChunk = true;
//         let originalSelection;
//         if (editorRef.current) {
//             originalSelection = editorRef.current.state.selection.main;
//         }
//         await askGPT(prompt, selectedText.current, async (chunk) => {
//             if (editorRef.current) {
//                 const editor = editorRef.current;
//                 if (chunk !== "j7&c#0Y7*O$X@Iz6E59Ix") {
//                     if (isFirstChunk) {
//                         isFirstChunk = false;
//                         originalSelection.to = insertCode(editor, chunk, true, originalSelection.from,
//                             originalSelection.to);
//                     } else {
//                         originalSelection.from = originalSelection.to;
//                         originalSelection.to = insertCode(editor, chunk, false, originalSelection.from);
//                     }
//                 }
//             }
//         })
//         setPromptBoxVisible(false);
//     };
//     const handlePromptSubmit = (inputValue) => {
//         handleGPTRequest(inputValue);
//     };
//
//     const handlePromptCancel = () => {
//         setPromptBoxVisible(false);
//     };
//
//     /******************************************* HANDLE CODE OUTPUT PANEL *******************************************/
//     const outputPanel = () => {
//         if (language === "python") {
//             return (
//                 <PythonConsole pythonCode={code} className={"bg-dark"} />
//             )
//         }else if (language === "html") {
//             return (
//                 <HtmlRenderer code={debouncedCode} className={"bg-dark"} />
//             )
//         }
//     }
//
//     /********************************************** HANDLE DEBOUNCING **********************************************/
//     const [debouncedCode, setDebouncedCode] = useState(code);
//     const updateDebouncedCode = useCallback(debounce(setDebouncedCode, 500), []);
//     // Use an effect to update the debounced HTML when the HTML changes
//     useEffect(() => {
//         updateDebouncedCode(code);
//     }, [code, updateDebouncedCode]);
//
//
//     /************************************** HANDLE OPENING AND CLOSING FILES **************************************/
//     const [files, setFiles] = useState(testFiles); // {fileName: {isOpen: Bool, content: String}}
//
//     // TODO on load, grab files from S3, set all to closed
//
//     // TODO if a file is clicked, set isOpen to true
//     function openFile(fileName) {
//         setFiles(prevFiles => {
//             const newFiles = { ...prevFiles }; // Create a copy of the previous state
//
//             if (fileName in newFiles) {
//                 newFiles["test"] = {isOpen: true, content: ''};
//             } else {
//                 newFiles["test"] = {isOpen: true, content: ''};
//             }
//
//             return newFiles; // Return the updated copy
//         });
//     }
//
//
//     // TODO if a tab is closed, set file object closed
//
//     // TODO if new file is added, add new object to files and set to open
//
//     // TODO if file is saved, save file to S3 and update files object
//
//
//     return (
//         <div className={'wrapper'} >
//             <Sidebar style={{overflow: "hidden"}} openFile={openFile} ></Sidebar>
//             <PromptBox
//                 isVisible={promptBoxVisible}
//                 onSubmit={handlePromptSubmit}
//                 onCancel={handlePromptCancel}
//             />
//             <Panel id={"code-mirror-container"} width={panelWidths.leftWidth} >
//                 {showMenu && (
//                     <ContextMenu menuPosition={menuPosition} setPromptBoxVisible={setPromptBoxVisible}
//                                  onClick={() => setShowMenu(false)} setShowMenu={setShowMenu} showMenu={showMenu}/>
//                 )}
//                 <TabbedEditor code={code} setCode={setCode} language={language} editorRef={editorRef}
//                               handleContextMenu={handleContextMenu} files={files} setFiles={setFiles}
//                 />
//             </Panel>
//             <Divider onMouseDown={onMouseDown} />
//             <Panel width={panelWidths.rightWidth}>
//                 {outputPanel()}
//             </Panel>
//         </div>
//     );
// }
//
//
