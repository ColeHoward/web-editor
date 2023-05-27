import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import CodeEditor from "./pages/CodeEditor";
import PythonConsole from "./components/PythonConsole";
import TestComponent from "./TestComponent";
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
