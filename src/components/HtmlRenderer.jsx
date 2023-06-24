import React, {useCallback, useEffect, useState} from "react";
import DOMPurify from "dompurify";
import {debounce} from "lodash";

export const HtmlRenderer = ({code}) => {
	/* ************************ HANDLE DEBOUNCING ************************ */
	const [sanitizedCode, setSanitizedCode] = useState(code);

	const debouncedSetSanitizedCode = debounce(setSanitizedCode, 500); // Debouncing with 500ms delay

	useEffect(() => {
		// debouncing makes opening tabs pretty slow
		debouncedSetSanitizedCode(DOMPurify.sanitize(code, {WHOLE_DOCUMENT: true})); // still need to sanitize JS
	}, [code, debouncedSetSanitizedCode]);

	return (
		<iframe
			title="html-renderer"
			srcDoc={sanitizedCode}
			style={{
				backgroundColor: "white",
				height: '100%',
				width: '100%',
				border: 'none',
				overflowY: 'auto'
			}}
		/>
	)
}



