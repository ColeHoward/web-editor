import React, {useEffect} from 'react';
import {Button} from 'react-bootstrap';


const ContextMenu = ({ menuPosition, setPromptBoxVisible, setShowMenu, showMenu }) => {
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showMenu && !event.target.closest(".context-menu")) {
				setShowMenu(false);
			}
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showMenu]);
	return (
		<div
			className="context-menu"
			style={{
				position: 'fixed',
				top: menuPosition.y,
				left: menuPosition.x,
				zIndex: 9999,
			}}
		>
			<Button onClick={() => {
				setPromptBoxVisible(true);
				setShowMenu(false);
			}}>Suggest</Button>
		</div>
	);
};

export default ContextMenu;

