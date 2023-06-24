import React, { useState, useEffect, useCallback } from 'react';
import {Tab, Box } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import CodeEditor from './CodeEditor';  // Import your CodeEditor here
import {ReactComponent as CloseIcon} from '../assets/icons/close.svg'
import SimpleBar from 'simplebar-react';


// File object structure: {id, name, content, language}
const TabbedEditor = ({ code, setCode, language, editorRef, files, setFiles, handleContextMenu }) => {
	const [selectedTab, setSelectedTab] = useState("");
	useEffect(() => {
		const openFile = Object.keys(files).find(fileName => files[fileName].isOpen);
		setSelectedTab(openFile || "");
	}, [files, setSelectedTab]);

	useEffect(() => {
		const currentFile = files[selectedTab];
		if (currentFile && currentFile.isOpen) {
			setCode(currentFile.content || "");
		}
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

	const handleTabChange = (event, newValue) => {
		setSelectedTab(newValue);
	};

	const closeTab = useCallback(
		fileName => {
			setFiles(prevFiles => ({
				...prevFiles,
				[fileName]: {
					...prevFiles[fileName],
					isOpen: false,
				},
			}));
		},
		[setFiles]
	);

	// TODO need to have variable in DevelopmentPage to not show this component when no tabs are open
	const areAnyFilesOpen = Object.values(files).some(file => file.isOpen);
	return (
		<TabContext value={selectedTab}>
			<Box sx={{ borderBottom: 1, borderColor: "divider", minHeight: "48px", display: areAnyFilesOpen ? 'block' : 'none' }}>
				<TabList onChange={handleTabChange} variant="standard" scrollButtons="auto" sx={{
					'& .MuiTabs-indicator': {
						backgroundColor: '#89CFEF'
					}
				}}>
					{Object.keys(files)
						.filter(fileName => {return (fileName in files && files[fileName].isOpen)})
						.map(fileName => (
							<Tab
								label={
									<div style={{ display: "flex", color: 'gray', alignItems: "center" }}>
										{fileName !== "" ? fileName.substring(fileName.lastIndexOf('/') + 1) : fileName}
										<CloseIcon
											style={{ height: "11px" }}
											onClick={event => {
												event.stopPropagation();
												closeTab(fileName);
											}}
										/>
									</div>
								}
								value={fileName}
								key={fileName}
								sx={{ textTransform: 'none', fontSize: '12px' }}
							/>
						))}
				</TabList>
			</Box>
			{areAnyFilesOpen && (
				<TabPanel value={selectedTab} style={{ overflowY: "auto" }} >
					<SimpleBar style={{ maxHeight: "calc(100vh - 48px)" }}>
						<CodeEditor
							language={language}
							code={files[selectedTab]?.content || ""}
							setCode={handleCodeChange}
							editorRef={editorRef}
							handleContextMenu={handleContextMenu}
						/>
					</SimpleBar>
				</TabPanel>
			)}
		</TabContext>
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