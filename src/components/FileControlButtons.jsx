import {IconButton, FormControl} from '@mui/material';
import NoteAddIcon from '@mui/icons-material/NoteAdd';
import CreateNewFolderIcon from '@mui/icons-material/CreateNewFolder';
import { useState } from 'react';

const FileControlButtons = ({ files }) => {
	const [newFileName, setNewFileName] = useState("");
	const [isAddingFile, setIsAddingFile] = useState(false);
	const handleNewFile = () => {
		setIsAddingFile(true);
	}

	const handleFileSubmit = (e) => {
		if(e.key === 'Enter'){
			console.log('Add new file', newFileName);
			setIsAddingFile(false);
			setNewFileName("");
			// add the file to your files state
		}
	}

	const handleNewDirectory = () => {
		console.log('Add new directory');
		// Add function for adding a new directory here
	}

	return (
		<div style={{
			display: 'flex', justifyContent: 'space-evenly', alignItems: "flex-start", flexGrow: 0,
			height: "25px",
			width: "100px"
		}}>
			<IconButton onClick={handleNewFile} style={{background: "transparent", flexGrow: 0}}>
				<NoteAddIcon />
			</IconButton>
			<IconButton onClick={handleNewDirectory} style={{background: "transparent", flexGrow: 0}}>
				<CreateNewFolderIcon />
			</IconButton>
			{isAddingFile && (
				<FormControl>
					<input
						type="text"
						onKeyDown={handleFileSubmit}
						style={{width: "100%", height: "15px", float: "left"}}
						value={newFileName}
						onChange={e => setNewFileName(e.target.value)}
						autoFocus
					/>
				</FormControl>
			)}
		</div>
	)
}

export default FileControlButtons;
