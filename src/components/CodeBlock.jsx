import React from 'react';
import Prism from 'prismjs';
// import './style/prism-shades-of-purple.css';
// import './style/codeBlockStyle.css';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import { useEffect, useState } from 'react';
import {CopyIcon} from './icons/CopyIcon';
const CodeBlock = ({ language, code }) => {

	useEffect(() => {
		Prism.highlightAll();
	}, [code]);

	const handleCopy = async () => {
		try {
			// Copy code to clipboard
			await navigator.clipboard.writeText(code);
			// Set isCopied to true
		} catch (err) {
			console.error('Failed to copy text: ', err);
		}
	};

	return (
		<pre style={{border: "none", backgroundColor: "transparent", position: "relative", margin: 0, paddingTop: 0, paddingBottom: 0}}>
            {/* Copy Button */}
			<CopyIcon handleCopy={handleCopy}
					  style={{
						  position: "absolute",
						  top: "10px",
						  right: "30px",
						  width: "20px",
						  height: "20px",
						  cursor: "pointer",
						  fontFamily: "consolas, monospace",
					}}
					  />
			{/* Code */}
			<code className={`language-${language}`} style={{fontSize: "15px"}}>
                {code}
            </code>
        </pre>
	);
}


export default CodeBlock;

