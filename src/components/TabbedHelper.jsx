import React, { useState } from 'react';
import {Tab, Box } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import PythonConsole from "./PythonConsole";
import ChatPanel from "./ChatPanel";
import {HtmlRenderer} from "./HtmlRenderer";

const TabbedHelper = ({ setCode, language, files, setFiles, code, currWidth, currFilePath, containerId }) => {
	const [selectedTab, setSelectedTab] = useState("Run");
	// const areAnyFilesOpen = Object.values(files).some(file => file.isOpen);
	const [messages, setMessages] = useState([]);
	const [consoleOutput, setConsoleOutput] = useState("");
	const outputTab = () => {
		if (language === "python") {
			return (
				<PythonConsole language={language} pythonCode={code} consoleOutput={consoleOutput}
							   setConsoleOutput={setConsoleOutput} filePath={currFilePath} containerId={containerId}
				/>
			)
		}else if (language === "html") {
			return (
				<HtmlRenderer code={code} className={"bg-dark"} />
			)
		}
	}
	return (
		<TabContext value={selectedTab}>
			<Box sx={{
				borderBottom: 1,
				borderColor: "divider",
				minHeight: "48px",
				width: "100%",
				display: "flex",
				justifyContent: "space-around",
				backgroundColor: "#1A1A1A"
			}}>
				<TabList onChange={(e, newTab) => setSelectedTab(newTab)}
						 variant="fullWidth" scrollButtons="auto" sx={{
					'& .MuiTabs-indicator': {
						backgroundColor: 'gray',
						height: "1px"
					},
					'& .Mui-selected': {
						color: "#89CFEF !important"
					}
				}}>
					<Tab
						label={"Run"}
						value={"Run"}
						key={"Run"}
						sx={{textTransform: 'none', fontSize: '12px', color: "gray"}}
					/>
					<Tab
						label={"Chat"}
						value={"Chat"}
						key={"Chat"}
						sx={{textTransform: 'none', fontSize: '12px', color: "gray"}}
					/>
				</TabList>
			</Box>

			<TabPanel value={selectedTab} style={{overflowY: "auto", backgroundColor: "#1A1A1A", display: "flex", justifyContent: "space-around", width: "100%"}}>
				{selectedTab === "Run" && (
						outputTab()
				)}
				{selectedTab === "Chat" && (
					<ChatPanel messages={messages} setMessages={setMessages} currWidth={.975 * currWidth} />
				)}


			</TabPanel>
		</TabContext>
	);
};

export default TabbedHelper;


