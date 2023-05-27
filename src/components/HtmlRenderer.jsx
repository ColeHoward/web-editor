import React, {useCallback, useEffect, useState} from "react";
import DOMPurify from "dompurify";


export const HtmlRenderer = ({code}) => {
	/* ************************ HANDLE DEBOUNCING ************************ */
	const [sanitizedCode, setSanitizedCode] = useState(code);
	useEffect(() => {
		setSanitizedCode(DOMPurify.sanitize(code, {WHOLE_DOCUMENT: true})); // still need to sanitize JS
	}, [code]);

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

