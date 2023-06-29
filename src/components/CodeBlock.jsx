import React from 'react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import { useEffect, useState } from 'react';
import {CopyIcon} from './icons/CopyIcon';


const CodeBlock = ({ language, code }) => {
	const [isCopied, setIsCopied] = useState(false);
	useEffect(() => {
		Prism.highlightAll();
	}, [code]);

	const handleCopy = async () => {
		try {
			// Copy code to clipboard
			await navigator.clipboard.writeText(code);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 1000);
			// Set isCopied to true
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	return (
		<div id={"code-block-wrapper"} style={{border: "2px solid #ffffff0f", borderRadius: "5px", paddingBottom: "10px"}}>
			<div id={"codeblock-header"} style={{display: "flex", justifyContent: "space-between", padding: "5px 10px",
				alignItems: "center", width: "100%", height: "28px", backgroundColor: "#ffffff0f", lineHeight: "25px",
				fontSize: "12px", marginBottom: "10px", borderRadius: "2px 2px 0 0"}}>
				<span style={{display: "block", color: "whitesmoke"}}>{language}</span>
				<div onClick={() => handleCopy()}
					style={{width: "calc(20px + 9ch + 5px)", display: "flex", justifyContent: "flex-end",
						alignItems: "center", cursor: "pointer"}}>
					<CopyIcon color={isCopied ? "#61dafb" : "gray"}
							  style={{
								  width: "16px",
								  height: "16px",
								  cursor: "pointer",
								  fontFamily: "consolas, monospace",
								  marginRight: "5px"
							  }}
					/>
					<span style={{display: "block", color: isCopied ? "#61dafb" : "whitesmoke"}}>Copy code</span>
				</div>
			</div>
			<pre style={{border: "none", backgroundColor: "transparent", position: "relative", margin: 0, paddingTop: 0, paddingBottom: 0}}>
				<code className={`language-${language}`} style={{fontSize: "15px"}}>
					{code}
				</code>
			</pre>
		</div>
	);
}


export default CodeBlock;

