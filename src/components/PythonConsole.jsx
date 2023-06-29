import 'bootstrap/dist/css/bootstrap.min.css'
import './style/pythonConsoleStyle.css'
import React, { useState } from 'react';
import { Card } from 'react-bootstrap';
import playIcon from  '../assets/icons/play-solid.svg';
// import stopIcon from  '../assets/icons/stop.svg';
import SimpleBar from "simplebar-react";
const { SSE } = require('sse.js');


function PythonConsole({ pythonCode, consoleOutput, setConsoleOutput }) {
	const runPythonCode = () => {
		if (!pythonCode.trim()) return;
		// Reset console output
		setConsoleOutput('');

		const url = `http://127.0.0.1:5000/execute`;

		try {
			const source = new SSE(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				payload: JSON.stringify({
					code: pythonCode,
				}),
			});

			source.stream();
			source.addEventListener('message', function(e) {
				// Append the new output to the console output
				setConsoleOutput((prevOutput) => {
					return prevOutput + JSON.parse(e.data)
				});
			});

			source.addEventListener('error', function(e) {
				source.close();
				setConsoleOutput('An error occurred while executing the Python code.');
			});

		} catch (err) {
			setConsoleOutput('An error occurred while executing the Python code.');
		}
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

