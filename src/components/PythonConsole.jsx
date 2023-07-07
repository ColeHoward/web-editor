import 'bootstrap/dist/css/bootstrap.min.css'
import './style/pythonConsoleStyle.css'
import React, { useState, useEffect } from 'react';
import { Card } from 'react-bootstrap';
import playIcon from  '../assets/icons/play-solid.svg';
import SimpleBar from "simplebar-react";
const { SSE } = require('sse.js');


function PythonConsole({ pythonCode, consoleOutput, setConsoleOutput, containerId, filePath }) {

	const runPythonCode = () => {
		if (!pythonCode.trim()) return;
		setConsoleOutput('');
		const url = `http://localhost:3003/execute?containerId=${containerId}&filepath=${filePath}`;

		const source = new SSE(url);

		source.addEventListener('message', function(e) {
			let output = e.data;
			// Replace "\\n" with newline characters
			let decodedOutput = output.replace(/\\n/g, '\n');
			setConsoleOutput((prev) => prev + decodedOutput);
		});

		source.addEventListener('DONE', function(e) {
			console.log('Stream finished.');
			source.close();
		});

		source.stream();
	};

	return (
		<Card style={{ height: 'calc(100vh - 48px - 15px)',width: "100%", overflowY: "hidden", padding: "10px 5p", backgroundColor: "rgb(30, 30, 30)"}} id={"pythonConsole"}>
			<Card.Header style={{width: "100%", height: "35px", display: "flex", justifyContent: "flex-start", alignItems: "center"}}>
				<img src={playIcon} alt="play" onClick={runPythonCode}
					 style={{width: "20px", height: "20px", cursor: "pointer", margin: "0 10px"}} />
				{/*<img src={stopIcon} alt="stop" style={{width: "20px", height: "20px"}} />*/}
			</Card.Header>
			<SimpleBar style={{
				maxHeight: "90vh",
				padding: "0px",
				maxWidth: "80vw",
			}}>
				<Card.Body style={{ textAlign: 'left', backgroundColor: "rgb(30, 30, 30)",
					height: "100%", overflow: "auto", borderBottomLeftRadius: "5px", borderBottomRightRadius: "5px" }}>  {/* Add this line */}
					<pre style={{ whiteSpace: 'pre', height: "100%", backgroundColor: "rgb(30, 30, 30)", border: "none", color: "mediumpurple"  }}>{consoleOutput}</pre>
				</Card.Body>
			</SimpleBar>
		</Card>
	);
}

export default PythonConsole;

