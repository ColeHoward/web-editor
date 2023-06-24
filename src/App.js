import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
// import PythonConsole from "./components/PythonConsole";
// import TestComponent from "./TestComponent";
import {DevelopmentPage} from "./pages/DevelopmentPage";
import FileTree from "./components/FileTree";
// import RegistrationForm from "./auth/RegistrationForm"
// import LoginForm from "./auth/LoginForm";
import {createTheme} from "@mui/material/styles";
import ThemeProvider from "@mui/material/styles/ThemeProvider";
import Sidebar from "./components/Sidebar";
import {TestComponent} from './TestComponent';
import TabbedEditor from "./components/TabbedEditor";
import {getProjectMetaData} from "./utilities/api";
import {useEffect, useState} from "react";

// PK: user#Cole, SK: project#testProject_file#main.py, fileLink: https://webeditorfiles.s3.us-west-1.amazonaws.com/Cole/testProject/main.py
// language: python type: file, S3 Key: Cole/testProject/main.py

let testFiles = {
    "file.py": {isOpen: true, content: "this is file 1\n\n\n", language: "python"},
    "file2.py": {isOpen: true, content: "this is file 2\n\n\n", language: "python"},
};

const testProjectId = "testProject";
const testUserId = "Cole";
const testProjectTree =
    [{ id: '5', name: 'testProject', children: [
            { id: '10', name: 'OSS' },
            { id: '11', name: 'file.txt', language: "html", filelink: "aws.com" },
            { id: '6', name: 'MUI', children: [
                    { id: '8', name: 'index.js', language: "javascript", filelink: "aws.com" },
                ]},
        ]}];

const theme = createTheme({
    palette: {
        mode: 'dark',
    },
});

function App() {
    // TODO move this logic into open/create project page
    let [userId, setUserId] = useState(testUserId);
    let [projectId, setProjectId] = useState(testProjectId);
    let [projectFiles, setProjectFiles] = useState({});
    let [projectTree, setProjectTree] = useState({});
    async function fetchData(userId, projectId) {
        let metaData = await getProjectMetaData(userId, projectId);
        setProjectFiles(metaData.fileMetaData);
        setProjectTree(metaData.projectTree);
    }

    useEffect(() => {
        setUserId(testUserId);
        setProjectId(testProjectId);
        fetchData(userId, projectId);
    }, [userId, projectId])

  return (
      <div className="App">
          <DevelopmentPage language={"python"} userId={testUserId} projectId={testProjectId} projectFiles={projectFiles}
            setProjectFiles={setProjectFiles} projectTree={projectTree}/>
          {/*<TestComponent language={"python"} />*/}
          {/*<ThemeProvider theme={theme}>*/}
          {/*  <LoginForm />*/}
          {/*</ThemeProvider>*/}
      </div>
  );
}

export default App;
