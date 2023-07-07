import React, {useRef, useEffect} from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import {vscodeDark} from "@uiw/codemirror-theme-vscode"
import './style/codeEditorStyle.css'



let languageObjs = {"python": python, "html": html}

function CodeEditor({code, setCode, language, editorRef, handleContextMenu}) {
	const cm = useRef(null);
	useEffect(() => {
		if (cm.current) {
			editorRef.current = cm.current.view;  // set the EditorView instance to the editorRef
		}
	}, [cm.current]);

	return (
			<CodeMirror
				ref={cm}
				value={code}
				onChange={(value) => setCode(value)}
				height="100%"
				width="100%"
				extensions={[languageObjs[language]()]}
				indentWithTab={true}
				theme={vscodeDark}
				autoFocus={true}
				onContextMenu={handleContextMenu}
			/>
	);
}

export default CodeEditor;
