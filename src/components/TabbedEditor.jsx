import React, { useState, useEffect, useCallback } from 'react';
import {Tab, Box } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import CodeEditor from './CodeEditor';
import {ReactComponent as CloseIcon} from '../assets/icons/close.svg'
import SimpleBar from 'simplebar-react';


const TabbedEditor = ({ setCode, language, editorRef, files, setFiles, handleContextMenu, setCurrFilePath }) => {
	const [selectedTab, setSelectedTab] = useState(null);
	const [openTabs, setOpenTabs] = useState(Object.keys(files).filter(fileName => files[fileName].isOpen));

	useEffect(() => {
		setOpenTabs(Object.keys(files).filter(fileName => files[fileName].isOpen));
	}, [files]);


	useEffect(() => {
		if (!openTabs.includes(selectedTab)) {
			const firstOpenTab = openTabs[0];
			setSelectedTab(firstOpenTab || null);
		}
	}, [openTabs, selectedTab]);

	useEffect(() => {
		const currentFile = files[selectedTab];
		if (currentFile && currentFile.isOpen) {
			setCode(currentFile.content || "");
		}
		setCurrFilePath(selectedTab || "")
	}, [selectedTab, files, setCode]);

	const handleCodeChange = useCallback(
		newCode => {
			setFiles(prevFiles => ({
				...prevFiles,
				[selectedTab]: {
					...prevFiles[selectedTab],
					content: newCode,
				},
			}));
			setCode(newCode);
		},
		[selectedTab, setFiles, setCode]
	);
	const closeTab = ((fileName) => {
			setFiles(prevFiles => ({
				...prevFiles,
				[fileName]: {
					...prevFiles[fileName],
					isOpen: false,
				},
			}));

			// if we closed the current tab, select another one
			if (selectedTab === fileName) {
				const anotherOpenFile = Object.keys(files).find(fn => fn !== fileName && files[fn].isOpen);
				setSelectedTab(anotherOpenFile || "");
			}
		}
	);

	return (
		<>
		{selectedTab && (
		<TabContext value={selectedTab}>
				<>
					<Box sx={{
						borderBottom: 1,
						borderColor: "divider",
						minHeight: "48px",
						display: 'block'
					}}>
						<TabList onChange={(e, newTab) => {
							if (files[newTab].isOpen) {
								setSelectedTab(newTab);
							}
						}}
						variant="standard" scrollButtons="auto" sx={{
							'& .MuiTabs-indicator': {
								backgroundColor: '#89CFEF',
								height: "1px"
							}
						}}>
							{Object.keys(files)
								.filter(fileName => {
									return (fileName in files && files[fileName].isOpen)
								})
								.map(fileName => (
									<Tab
										label={
											<div style={{display: "flex", color: 'gray', alignItems: "center"}}>
												{fileName !== "" ? fileName.substring(fileName.lastIndexOf('/') + 1) : fileName}
												<CloseIcon
													style={{height: "11px"}}
													onClick={event => {
														event.stopPropagation();
														closeTab(fileName);
													}}
												/>
											</div>
										}
										value={fileName}
										key={fileName}
										sx={{textTransform: 'none', fontSize: '12px'}}
									/>
								))}
						</TabList>
					</Box>

					<TabPanel value={selectedTab} style={{overflowY: "auto"}}>
						<SimpleBar style={{maxHeight: "calc(100vh - 48px)"}}>
							<CodeEditor
								language={language}
								code={files[selectedTab]?.content || ""}
								setCode={handleCodeChange}
								editorRef={editorRef}
								handleContextMenu={handleContextMenu}
							/>
						</SimpleBar>
					</TabPanel>
				</>
		</TabContext>
		)}
		</>
	);
};

export default TabbedEditor;


// useEffect(() => {
// 	const handler = async (event) => {
// 		// need: file name, unique project name, unique user id, project structure, file content
// 		// Check if command (or ctrl for windows) and 's' are pressed
// 		if ((event.metaKey || event.ctrlKey) && String.fromCharCode(event.which).toLowerCase() === 's') {
// 			event.preventDefault();
// 			// const [code, fileName, userId, projectId, fileStructure] =
//
// 			// Assuming your code and filename are stored in state
// 			// TODO file name will have to be userId + fileName; idk what the separator should be
// 			const response = await fetch('http://localhost:3002/save-code', {
// 				method: 'POST',
// 				headers: {
// 					'Content-Type': 'application/json'
// 				},
// 				body: JSON.stringify({
// 					code: code,
// 					userId: userId,
// 					projectId: projectId,
// 					filename: fileContents[selectedTab],
// 				})
// 			})
//
// 			console.log(response.data);
// 		}
// 	};
//
// 	// Add the event listener
// 	window.addEventListener('keydown', handler);
//
// 	// Remove the event listener when the component unmounts
// 	return () => window.removeEventListener('keydown', handler);
// }, []);
