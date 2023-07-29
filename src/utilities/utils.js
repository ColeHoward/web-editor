import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';
import askGPT from "./api";

export function formatCode(code) {
    return prettier.format(code, {
        parser: "html",
        plugins: [parserHtml],
        printWidth: 80,
        tabWidth: 4,
        singleQuote: true,
        trailingComma: "all",
        bracketSpacing: true,
        semi: true,
    });
}

export function insertCode(editor, chunk, isFirstChunk, from = null, to = null) {
    const { state } = editor;

    // If a position is provided, and it's larger than the document's length or < 0, adjust it
    if (from !== null && from > state.doc.length) {
        from = state.doc.length;
    }else if (to !== null && to < 0) {
        to = 0;
    }

    if (isFirstChunk) {
        // If it's the first chunk, replace the selected text with the chunk
        editor.dispatch({ changes: { from: from, to: to, insert: chunk }, scrollIntoView: true });
    } else {
        // If it's not the first chunk, just insert it at the provided position
        editor.dispatch({ changes: { from: from, insert: chunk }, scrollIntoView: true });
    }

    // Set the cursor position at the end of the inserted text
    editor.dispatch({ selection: { anchor: from + chunk.length } });

    // Return the new insertion point
    return from + chunk.length;
}

export function buildMetaData(files) {
    if (!files || files.length === 0 || !files[0].SK) {
        console.error('Invalid files data:', files);
        return {fileMetaData: {}, projectTree: {}};
    }
    // project tree only needs to store the path and its children
    // other metadata should be stored in separate dictionary
    let idCounter = 1;
    let projectName = files[0].SK.split('#')[1].replace('_file', '');  // Assuming all files belong to the same project
    let projectTree = { id: idCounter++, name: projectName, children: [] };
    let nodeLookup = { [projectName]: projectTree };
    let fileMetaData = {};

    // iterate through sorted files and create tree
    for (let file of files) {
        let filePath = file.SK.split('#')[2];
        let pathArr = filePath.split('/');

        // create nodes for each directory in path
        let currentPath = projectName;
        for (let dir of pathArr) {
            currentPath += '/' + dir;
            // create new node if it doesn't exist already
            if (!(currentPath in nodeLookup)) {
                let newNode = { id: idCounter++, name: dir, children: [] };
                nodeLookup[currentPath] = newNode;
                nodeLookup[currentPath.slice(0, currentPath.lastIndexOf('/'))].children.push(newNode);
            }
        }
        fileMetaData[currentPath] = {fileLink: file.fileLink, language: file.language, isOpen: false, s3_key: file.s3_key};
    }

    return {fileMetaData: fileMetaData, projectTree: projectTree};
}

export const insertGPTResponse = async (prompt, editorRef, selectedText, setPromptBoxVisible) => {
    let isFirstChunk = true;
    let originalSelection;
    if (editorRef.current) {
        originalSelection = editorRef.current.state.selection.main;
    }
    await askGPT(prompt, selectedText.current, async (chunk) => {
        if (editorRef.current) {
            const editor = editorRef.current;
            if (chunk !== "j7&c#0Y7*O$X@Iz6E59Ix") {
                if (isFirstChunk) {
                    isFirstChunk = false;
                    originalSelection.to = insertCode(editor, chunk, true, originalSelection.from,
                        originalSelection.to);
                } else {
                    originalSelection.from = originalSelection.to;
                    originalSelection.to = insertCode(editor, chunk, false, originalSelection.from);
                }
            }
        }
    })
    if (setPromptBoxVisible) {
        setPromptBoxVisible(false);
    }
};

export function debounce(func, delay) {
    let timerId;

    return function (...args) {
        const context = this;

        clearTimeout(timerId);

        timerId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}
