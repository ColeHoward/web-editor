import React, { useRef, useEffect, useCallback } from 'react';
import { Toast, Form } from 'react-bootstrap';
import ResizableTextArea from "./ResizableTextarea";
import SendIcon from "./icons/SendIcon"
import {insertGPTResponse} from "../utilities/utils";


function PromptBox({ isVisible, onCancel, position }) {
	const [inputValue, setInputValue] = React.useState('');
	const toastRef = useRef(null);
	const [textAreaHeight, setTextAreaHeight] = React.useState(20);
	const [width, setWidth] = React.useState(400);
	useEffect(() => {
		const observer = new ResizeObserver(entries => {
			for (let entry of entries) {
				setWidth(entry.contentRect.width);
			}
		});

		if (toastRef.current) {
			observer.observe(toastRef.current);
		}

		return () => {
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		function handleOutsideClick(event) {
			if (toastRef.current && !toastRef.current.contains(event.target)) {
				onCancel();
			}
		}
		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, [onCancel]);

	useEffect(() => {
		if (toastRef.current && toastRef.current.width) {
			setWidth(toastRef.current.width);
		}
	}, [toastRef.current]);


	const handleSubmit = useCallback(() => {
		insertGPTResponse(inputValue)
		onCancel();
		setInputValue('');
	}, [inputValue]);

	return (
		<Toast id={"promptBox"}
			   ref={toastRef}
			   show={isVisible}
			   onClose={onCancel}
			   animation={false}
			   style={{
				   position: 'absolute',
				   top: position.y,
				   left: position.x,
				   backgroundColor: "rgb(30, 30, 30)",
				   boxShadow: "0 0 10px rgba(255, 255, 255,.2)",
				   zIndex: "99999",
				   width: "30vw",
				   height: `${textAreaHeight + 45}px`,
				   border: "1px solid gray",
				   borderRadius: "5px",
			   }}
		>
			<Toast.Header closeButton={false} style={{
				display: "flex",
				justifyContent: "flex-start",
				alignItems: "center",
				padding: "5px",
				color: "whitesmoke",
				backgroundColor: "rgba(255, 255, 255, 0.06)"
			}}>
				<strong className="mr-auto">Prompt</strong>
			</Toast.Header>

			<Form onSubmit={handleSubmit}>
				<Toast.Body style={{width: "100%", overflowY: "hidden",display: "flex",
					justifyContent: "flex-start",
					alignItems: "flex-end", padding: "5px"}}>
					<ResizableTextArea
						inputValue={inputValue}
						setInputValue={setInputValue}
						handleSubmit={handleSubmit}
						returnHeight={setTextAreaHeight}  // If you need to implement some function on resize, define here
						style={{overflowY: "hidden", maxWidth: "calc(30vw - 40px)"}}
						width={width}
					/>
					<SendIcon type="submit" onClick={handleSubmit}
							  style={{ color: "gray", width: "20px", height: "20px", flexGrow: "0", cursor: "pointer",
							  marginLeft: "5px"}}
							  title="Shift+Enter" idSuffix="toast"/>
				</Toast.Body>
			</Form>
		</Toast>
	);
}



export default PromptBox;
