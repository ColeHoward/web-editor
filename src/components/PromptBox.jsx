// PromptBox.jsx
import 'bootstrap/dist/css/bootstrap.min.css';
import React, {useCallback, useEffect, useRef} from 'react';
import { Toast, Button, Form } from 'react-bootstrap';

function PromptBox({ isVisible, onSubmit, onCancel }) {
	const [inputValue, setInputValue] = React.useState('');
	const inputRef = useRef(null);
	useEffect(() => {
		if (inputRef.current) {
			inputRef.current.style.height = 'auto';
			inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
		}
	}, [inputValue]);

	const handleChange = (event) => {
		setInputValue(event.target.value);
	}
	const handleSubmit = useCallback((e) => {
		e.preventDefault();
		onSubmit(inputValue);
		setInputValue('');
	}, [inputValue, onSubmit]);

	return (
		<Toast id={"promptBox"}
			style={{
				position: 'fixed',
				top: '10%',
				right: '10%',
				width: '30%',
				zIndex: 1000,
				fontFamily: 'Noto Sans',
				opacity: 1
			}}
			show={isVisible}
			onClose={onCancel}
			   timeout={0}
			className={"bg-light"}
		>

			<Toast.Header closeButton={false}>
				<strong className="mr-auto">Prompt</strong>
			</Toast.Header>

			<Form onSubmit={handleSubmit}>
				<Toast.Body >
                    <textarea
						ref={inputRef}
						id="promptBox"
						value={inputValue}
						onChange={handleChange}
						placeholder="Type your prompt here..."
						autoFocus
						style={{
							width: '100%',
							height: 'auto',
							minHeight: '50px',
							maxHeight: '50vh',
							resize: 'none',
							overflow: 'auto',
							border: '1px solid #ced4da',
							borderRadius: '0.25rem',
							padding: '0.375rem 0.75rem',
							fontFamily: 'Noto Sans'
						}}
					/>
				</Toast.Body>

				<Toast.Header>
					<Button variant="secondary" style={{marginRight: '10px'}} onClick={onCancel}>
						Cancel
					</Button>
					<Button variant="primary" type="submit">
						Submit
					</Button>
				</Toast.Header>
			</Form>
		</Toast>
	);
}

export default PromptBox;
