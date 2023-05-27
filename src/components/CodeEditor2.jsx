import React, { useEffect, useRef, useState } from "react";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { python } from "@codemirror/lang-python";
import { indentOnInput } from "@codemirror/language";

const CodeEditor2 = ({ code, setCode }) => {
    const iframeRef = useRef();
    const [editorView, setEditorView] = useState(null);

    const initializeCodeMirror = () => {
        if (iframeRef.current && !editorView) {
            const doc = iframeRef.current.contentWindow.document;
            const codemirrorElement = doc.createElement("div");
            doc.body.appendChild(codemirrorElement);
            const newEditorView = new EditorView({
                state: EditorState.create({
                    doc: code,
                    extensions: [
                        oneDark,
                        python(),
                        indentOnInput(),
                        EditorView.updateListener.of((v) => {
                            if (v.docChanged) {
                                setCode(v.state.doc.toString());
                            }
                        }),
                    ],
                }),
                parent: codemirrorElement,
            });
            setEditorView(newEditorView);
        }
    };

    useEffect(() => {
        if (editorView) {
            const transaction = editorView.state.update({
                changes: { from: 0, to: editorView.state.doc.length, insert: code },
            });
            editorView.update([transaction]);
        }
    }, [code, editorView]);

    return (
        <iframe

            ref={iframeRef}
            onLoad={initializeCodeMirror}
            style={{ width: "100%", height: "100%" }}
        />
    );
};

export default CodeEditor2;
