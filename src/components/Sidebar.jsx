import './style/fileSidebar.css'
import React, {useState} from 'react';
import FileTree from './FileTree';
import FileIcon from '../assets/icons/file-sharp.svg';
import FormatIcon from '../assets/icons/format.svg';
import DataArrayIcon from '@mui/icons-material/DataArray';


export function Sidebar({projectTree}) {
	let [fileTreeOpen, setFileTreeOpen] = useState(false);
	return (
		<>
		<div
			style={{display: "flex", color: "gray", flexGrow: 0, alignItems: "center", flexDirection: "column", borderRight: "solid 1px gray"}}>
			{/* stand in for home button */}
			<DataArrayIcon style={{width: "auto", height: "25px",margin: "15px 10px 10px 10px", cursor: "pointer" }}/>
			<img title={"Files"} src={FileIcon} style={{width: "auto", height: "25px",margin: "10px 10px 10px 10px", cursor: "pointer" }} alt={"files"}
				 onClick={() => setFileTreeOpen(!fileTreeOpen)} />
			<img title={"auto-format"} src={FormatIcon} style={{width: "auto", height: "25px", margin: "10px 10px 10px 10px"}} alt={"format"}
			/>
		</div>
		{fileTreeOpen && <FileTree isOpen={fileTreeOpen} fileTree={projectTree}/>
		}
		</>
	)
}

export default Sidebar;

