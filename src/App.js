import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import CodeEditor from "./pages/CodeEditor";
import PythonConsole from "./components/PythonConsole";
import TestComponent from "./TestComponent";
import CodeEditor2 from "./components/CodeEditor2";
import {DevelopmentPage} from "./pages/DevelopmentPage";

function App() {
  return (
      <div className="App bg-dark">
        <DevelopmentPage language={"html"} />
        {/*  <TestComponent />*/}
      </div>
  );
}

export default App;
