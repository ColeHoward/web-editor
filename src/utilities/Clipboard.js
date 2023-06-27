export const copyToClipboard = (textToCopy) => {
	navigator.clipboard.writeText(textToCopy)
		.then(() => {
			console.log('Text copied to clipboard');
			// TODO
		})
		.catch(err => {
			console.error('Could not copy text: ', err);
		});
}

export const pasteFromClipboard = () => {
	navigator.clipboard.readText()
		.then(text => {
			// TODO
			console.log('Pasted text: ', text);
		})
		.catch(err => {
			console.error('Could not paste text: ', err);
		});
}

export const cutToClipboard = (textToCut) => {
	navigator.clipboard.writeText(textToCut)
		.then(() => {
			// TODO
			console.log('Text cut to clipboard');
		})
		.catch(err => {
			console.error('Could not cut text: ', err);
		});
}