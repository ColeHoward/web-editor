import React, { useState, useEffect, useContext } from 'react';
import {Tab, Box } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import CodeEditor from './CodeEditor';
import {ReactComponent as CloseIcon} from '../assets/icons/close.svg'
import SimpleBar from 'simplebar-react';
import { FilesContext } from '../providers/FilesProvider';


const TabbedEditor = ({ language, editorRef, handleContextMenu }) => {
	const { files, setFiles, setCurrFile } = useContext(FilesContext);
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
		setCurrFile(selectedTab || "")
	}, [selectedTab, files]);

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
								viewRef={editorRef}
								handleContextMenu={handleContextMenu}
								selectedTab={selectedTab}
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