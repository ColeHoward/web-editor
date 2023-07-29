import React, {useRef, useEffect, useContext} from 'react';
import {EditorView, basicSetup} from "codemirror"
import { keymap } from "@codemirror/view";
import {EditorState} from "@codemirror/state"
import {tags} from "@lezer/highlight"
import {HighlightStyle, syntaxHighlighting, indentUnit} from "@codemirror/language"
import { python } from "@codemirror/lang-python";
import { html } from "@codemirror/lang-html";
import './style/codeEditorStyle.css'
import {indentLess, insertTab} from "@codemirror/commands";
import {javascript} from '@codemirror/lang-javascript';
import { FilesContext } from '../providers/FilesProvider';
import {indentationMarkers} from '../indentation_guides/indentationMarkers'
import {updateS3File} from '../utilities/api'
import {updateFile} from "../utilities/api";
import {debounce} from "lodash";


// import { indentationMarkers } from '@replit/codemirror-indentation-markers'
const languageObjs = { python: python, html: html, javascript: javascript }

const tabKeymap =   keymap.of([
	{
		key: 'Tab',
		preventDefault: true,
		run: insertTab,
	},
	{
		key: 'Shift-Tab',
		preventDefault: true,
		run: indentLess,
	},
])

const myHighlightStyle = HighlightStyle.define([
	{ tag: tags.comment, color: "#999" },
	{ tag: tags.keyword, color: "#cc99cd" },
	{ tag: tags.operator, color: "#67cdcc" },
	{ tag: tags.atom, color: "#f08d49" },
	{ tag: tags.number, color: "#f08d49" },
	{ tag: tags.string, color: "#7ec699" },
	{ tag: tags.literal, color: "#7ec699" },
	{ tag: tags.className, color: "#f8c555" },
	{ tag: tags.function(tags.variableName), color: "#f08d49" },
	{ tag: tags.punctuation, color: "#ccc" },
	{ tag: tags.meta, color: "#f8c555" },
	{ tag: tags.link, color: "#67cdcc" },
	{ tag: tags.inserted, color: "green" },
	{ tag: tags.deleted, color: "#e2777a" },
	{ tag: tags.tagName, color: "#e2777a" },
	{ tag: tags.attributeName, color: "#e2777a" },
	{ tag: tags.escape, color: "f08d49"}
]);


let extensions = [
	basicSetup,
	syntaxHighlighting(myHighlightStyle),
	tabKeymap,
	indentUnit.of('    '),
	indentationMarkers(),
]


function useCodeMirror(code, onCodeChange, language, viewRef) {

	const createView = (container) => {
		const state = EditorState.create({
			doc: code,
			extensions: [
				extensions,
				languageObjs[language](),
				EditorView.updateListener.of(update => {
					if (update.docChanged) {
						onCodeChange(update.state.doc.toString());
					}
				}),
			],
		});

		viewRef.current = new EditorView({ state, parent: container });
	}

	// const updateView = (newCode) => {
	// 	if (viewRef.current) {
	// 		const currentDoc = viewRef.current.state.doc.toString();
	// 		if (currentDoc !== newCode) {
	// 			let start = 0;
	// 			let end = Math.min(currentDoc.length, newCode.length);
	// 			while (start < end && currentDoc[start] === newCode[start]) {
	// 				start++;
	// 			}
	// 			while (start < end && currentDoc[end - 1] === newCode[end - 1]) {
	// 				end--;
	// 			}
	// 			const changes = { from: start, to: currentDoc.length - end + start, insert: newCode.slice(start, newCode.length - end + start) };
	// 			const tr = viewRef.current.state.update({ changes });
	// 			viewRef.current.dispatch(tr);
	// 		}
	// 	}
	// };


	const destroyView = () => {
		if (viewRef.current) {
			viewRef.current.destroy();
			viewRef.current = null;
		}
	}

	return { view: viewRef.current, createView, destroyView };
}

function CodeEditor({ selectedTab, language, viewRef, handleContextMenu }) {

	const { files, setFiles } = useContext(FilesContext);
	const code = files[selectedTab]?.content
	const editorDiv = useRef(null);

	const saveFile = debounce((newCode, selectedTab) => {
		// Code to save file
		updateFile(newCode, selectedTab).catch((err) => {
			console.log('code editor', err);
		})
		updateS3File(newCode, selectedTab, language).catch((err) => {
			console.log('code editor', err);
		})
	}, 1000);
	const handleCodeChange = (newCode) => {
		setFiles((prevFiles) => {
			return {
				...prevFiles,
				[selectedTab]: {
					...prevFiles[selectedTab],
					content: newCode,
				},
			};
		});
		saveFile(newCode, selectedTab);
	};



	const { view, createView, destroyView } = useCodeMirror(code, handleCodeChange, language, viewRef);

	useEffect(() => {
		if (editorDiv.current) {
			createView(editorDiv.current);
		}

		// cleanup function that runs when component is unmounted or when tab changes
		return () => {
			destroyView();
		}
	}, [selectedTab]);  // added selectedTab to the dependency array to ensure a new instance is created when tab changes

	// useEffect(() => {
	// 	updateView(code);
	// }, [code]);

	return <div ref={editorDiv} className={"code-editor"} onContextMenu={handleContextMenu} />;
}


export default CodeEditor;