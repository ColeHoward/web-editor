export const copyToClipboard = (textToCopy) => {
	navigator.clipboard.writeText(textToCopy)
		.then(() => {
			console.log('Text copied to clipboard');
		})
		.catch(err => {
			console.error('Could not copy text: ', err);
		});
}

export const pasteFromClipboard = () => {
	navigator.clipboard.readText()
		.then(text => {
			console.log('Pasted text: ', text);
		})
		.catch(err => {
			console.error('Could not paste text: ', err);
		});
}

export const cutToClipboard = (textToCut) => {
	navigator.clipboard.writeText(textToCut)
		.then(() => {
			console.log('Text cut to clipboard');
			// After cut operation, the text should be removed from its source.
			// Remove or replace the text from its source here.
		})
		.catch(err => {
			console.error('Could not cut text: ', err);
		});
}