import prettier from 'prettier/standalone';
import parserHtml from 'prettier/parser-html';

export function formatCode(code) {
    return prettier.format(code, {
        parser: "html",
        plugins: [parserHtml],
        printWidth: 80,
        tabWidth: 2,
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


