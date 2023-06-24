import React, {useEffect} from 'react';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';
import Typography from '@mui/material/Typography';
import ContentCut from '@mui/icons-material/ContentCut';
import ContentCopy from '@mui/icons-material/ContentCopy';
import ContentPaste from '@mui/icons-material/ContentPaste';
import Cloud from '@mui/icons-material/Cloud';
import {copyToClipboard, pasteFromClipboard, cutToClipboard} from '../utilities/Clipboard';





export default function ContextMenu({ menuPosition, setPromptBoxVisible, setShowMenu, showMenu }) {
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showMenu && !event.target.closest(".context-menu")) {
				setShowMenu(false);
			}
		}

		document.addEventListener('click', handleClickOutside);
		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	}, [showMenu]);

	const getSelectedText = () => {
		let text = "";
		if (window.getSelection) {
			text = window.getSelection().toString();
		} else if (document.selection && document.selection.type !== "Control") {
			text = document.selection.createRange().text;
		}
		return text;
	};

	return (
		<Paper sx={{width: "250px", maxWidth: '320px', position: "fixed",
					top: menuPosition.y,
					left: menuPosition.x,
					zIndex: 9999,
				}}>
			<MenuList>
				<MenuItem onClick={() => cutToClipboard(getSelectedText())}>
					<ListItemIcon >
						<ContentCut fontSize="small" />
					</ListItemIcon>
					<ListItemText>Cut</ListItemText>
					<Typography variant="body2" color="text.secondary">
						⌘X
					</Typography>
				</MenuItem>
				<MenuItem onClick={() => copyToClipboard(getSelectedText())}>
					<ListItemIcon>
						<ContentCopy fontSize="small" />
					</ListItemIcon>
					<ListItemText>Copy</ListItemText>
					<Typography variant="body2" color="text.secondary">
						⌘C
					</Typography>
				</MenuItem>
				<MenuItem onClick={() => pasteFromClipboard()}>
					<ListItemIcon>
						<ContentPaste fontSize="small" />
					</ListItemIcon>
					<ListItemText>Paste</ListItemText>
					<Typography variant="body2" color="text.secondary">
						⌘V
					</Typography>
				</MenuItem>
				<Divider />
				<MenuItem onClick={(e) => {e.stopPropagation(); setPromptBoxVisible(true); setShowMenu(false); }}  >
					<ListItemIcon>
						<Cloud fontSize="small" />
					</ListItemIcon>
					<ListItemText>Suggest</ListItemText>
				</MenuItem>
			</MenuList>
		</Paper>
	);
}


// const ContextMenu = ({ menuPosition, setPromptBoxVisible, setShowMenu, showMenu }) => {
// 	useEffect(() => {
// 		const handleClickOutside = (event) => {
// 			if (showMenu && !event.target.closest(".context-menu")) {
// 				setShowMenu(false);
// 			}
// 		}
//
// 		document.addEventListener('mousedown', handleClickOutside);
// 		return () => {
// 			document.removeEventListener('mousedown', handleClickOutside);
// 		};
// 	}, [showMenu]);
// 	return (
// 		<div
// 			className="context-menu"
// 			style={{
// 				position: 'fixed',
// 				top: menuPosition.y,
// 				left: menuPosition.x,
// 				zIndex: 9999,
// 			}}
// 		>
// 			<Button onClick={() => {
// 				setPromptBoxVisible(true);
// 				setShowMenu(false);
// 			}}>Suggest</Button>
// 		</div>
// 	);
// };
//
// export default ContextMenu;

