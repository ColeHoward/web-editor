import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {DevelopmentPage} from "./pages/DevelopmentPage";
import {createTheme} from "@mui/material/styles";
import {getProjectMetaData} from "./utilities/api";
import {useEffect, useState} from "react";


const testProjectId = "testProject";
const testUserId = "Cole";

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
      </div>
  );
}
export default App;
