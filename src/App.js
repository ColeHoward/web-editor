import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import {DevelopmentPage} from "./pages/DevelopmentPage";
import {getProjectMetaData} from "./utilities/api";
import {useEffect, useState} from "react";
import {FilesProvider} from "./providers/FilesProvider";
import {setupEnv} from "./utilities/api";


const testProjectId = "testProject";
const testUserId = "Cole";

function App() {
    // TODO move this logic into open/create project page
    // TODO initialize file context
    const [userId, setUserId] = useState(testUserId);
    const [projectId, setProjectId] = useState(testProjectId);
    const [projectFiles, setProjectFiles] = useState({});
    const [projectTree, setProjectTree] = useState({});
    const [containerId, setContainerId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const containerID = await setupEnv(userId, projectId);
            setContainerId(containerID);
            if (!containerID){
                console.log("Error setting up container");
            }
        }

        fetchData();
        // If you have a cleanup function, it should still be returned here.
        // return () => { ... }

    }, [userId, projectId])

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
          <FilesProvider projectFiles={projectFiles}>
          <DevelopmentPage language={"python"} userId={testUserId} projectId={testProjectId} projectFiles={projectFiles}
            setProjectFiles={setProjectFiles} projectTree={projectTree} containerId={containerId}/>
          </FilesProvider>
      </div>
  );
}

export default App;
