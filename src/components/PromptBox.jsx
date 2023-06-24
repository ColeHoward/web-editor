import 'bootstrap/dist/css/bootstrap.min.css';
import './style/promptBoxStyle.css';
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
			show={isVisible}
			onClose={onCancel}
		>
			<Toast.Header closeButton={false}>
				<strong className="mr-auto">Prompt</strong>
			</Toast.Header>

			<Form onSubmit={handleSubmit}>
				<Toast.Body >
                    <textarea
						id={"promptText"}
						ref={inputRef}
						value={inputValue}
						onChange={handleChange}
						placeholder="Type your prompt here..."
						autoFocus
					/>
				</Toast.Body>
				<Toast.Header id={'toast-footer'}>
					<Button variant="secondary" style={{marginRight: '10px'}} onClick={onCancel} id={'cancel'}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" className={'text-dark'}>
						Submit
					</Button>
				</Toast.Header>
			</Form>
		</Toast>
	);
}

export default PromptBox;
