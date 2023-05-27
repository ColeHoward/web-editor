// // PromptBox.jsx
// import React from 'react';
// import { Modal, Button, Form } from 'react-bootstrap';
//
// function ModalPromptBox({ isVisible, onSubmit, onCancel }) {
// 	const [inputValue, setInputValue] = React.useState('');
//
// 	const handleSubmit = (e) => {
// 		e.preventDefault();
// 		onSubmit(inputValue);
// 		setInputValue('');
// 	};
//
// 	return (
// 		<Modal show={isVisible} onHide={onCancel} centered>
// 			<Modal.Header closeButton>
// 				<Modal.Title>Prompt</Modal.Title>
// 			</Modal.Header>
//
// 			<Form onSubmit={handleSubmit}>
// 				<Modal.Body>
// 					<Form.Group>
// 						<Form.Control
// 							as="textarea"
// 							id="promptBox"
// 							value={inputValue}
// 							onChange={e => setInputValue(e.target.value)}
// 							placeholder="Type your prompt here..."
// 							autoFocus
// 						/>
// 					</Form.Group>
// 				</Modal.Body>
// 				<Modal.Footer>
// 					<Button variant="secondary" onClick={onCancel}>
// 						Cancel
// 					</Button>
// 					<Button variant="primary" type="submit">
// 						Submit
// 					</Button>
// 				</Modal.Footer>
// 			</Form>
// 		</Modal>
// 	);
// }
//
// export default PromptBox;
