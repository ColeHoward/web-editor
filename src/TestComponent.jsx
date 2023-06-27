import React, { useState } from 'react';
import {Tab, Box } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';
import SimpleBar from 'simplebar-react';
import PythonConsole from "./components/PythonConsole";
import ChatPanel from "./components/ChatPanel";
import './testComponentStyle.css'


const TestComponent = ({ setCode, language, files, setFiles, code }) => {
    const [selectedTab, setSelectedTab] = useState("Console");
    // const areAnyFilesOpen = Object.values(files).some(file => file.isOpen);
    const [messages, setMessages] = useState([]);
    const [consoleOutput, setConsoleOutput] = useState("");

    return (
        <TabContext value={selectedTab}>
                <Box sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    minHeight: "48px",
                    display:"block"
                }}>
                    <TabList onChange={(e, newTab) => setSelectedTab(newTab)}
                             variant="fullWidth" scrollButtons="auto" sx={{
                        '& .MuiTabs-indicator': {
                            backgroundColor: 'gray',
                            height: "1px"
                        },
                        '& .Mui-selected': {
                            color: "gray"
                        }
                    }}>
                        <Tab
                            label={"Console"}
                            value={"Console"}
                            key={"Console"}
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

                <TabPanel value={selectedTab} style={{overflowY: "auto"}}>
                        {selectedTab === "Console" && (
                            <SimpleBar style={{maxHeight: "calc(100vh - 48px)"}}>
                                <PythonConsole language={language} pythonCode={code} consoleOutput={consoleOutput}
                                    setConsoleOutput={setConsoleOutput}
                                />
                            </SimpleBar>
                        )}
                        {selectedTab === "Chat" && (
                            <ChatPanel messages={messages} setMessages={setMessages} />
                        )}


                </TabPanel>
        </TabContext>
    );
};

export default TestComponent;


