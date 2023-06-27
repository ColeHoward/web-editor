import React, {useCallback, useState, useEffect} from "react";
import './style/fileSidebar.css';
import './style/fileTreeStyle.css';
import TreeView from '@mui/lab/TreeView';
import TreeItem from '@mui/lab/TreeItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ReactComponent as ChevronRightIcon } from '../assets/icons/chevron-right-solid.svg';
import FileIcon from '../assets/icons/file-sharp.svg';
import {Divider} from "./Divider";
import FileControlButtons from "./FileControlButtons";
import { GlobalStyles } from '@mui/system';



// TODO implement create new file/directory and delete file/directory
const FileTree = ({ fileTree, minWidth = 100, maxWidth = 300 , openFile}) => {
	const [width, setWidth] = useState(minWidth);
	const [isResizing, setIsResizing] = useState(false);

	// Recursively generate file tree
	const renderTree = useCallback((node, path = '') => {
		let newPath;
		if (path === '') {
			newPath = node.name;
		} else {
			newPath = `${path}/${node.name}`;
		}
		if (node.children && node.children.length > 0) {
			return (
				<TreeItem
					nodeId={node.id.toString()}
					label={
						<div style={{ display: 'flex', alignItems: 'center', fontSize: "1.3em", textAlign: 'left' }}>
							{node.name}
						</div>
					}
					key={node.id}
				>
					{node.children.map(childNode => renderTree(childNode, newPath))}
				</TreeItem>
			);
		}
		return (
			<TreeItem
				nodeId={node.id.toString()}
				label={
					<div style={{ display: 'flex', alignItems: 'center', fontSize: "1.3em", width: "100%", textAlign: 'left'}}
						 onClick={() => openFile(newPath)}
					>
						<img src={FileIcon} alt="File" style={{ marginRight: '5px', height: "15px", width: "auto" }} />
						{node.name}
					</div>
				}
				key={node.id}
			/>
		);
	}, [fileTree]);

	const onMouseDown = useCallback((e) => {
		setIsResizing(true);
	}, []);

	const onMouseMove = useCallback((e) => {
		if (!isResizing) return;
		e.preventDefault()
		const {movementX} = e;
		setWidth((prevWidth) => Math.max(minWidth, Math.min(maxWidth, prevWidth + movementX)));
	}, [isResizing, maxWidth, minWidth]);

	const onMouseUp = useCallback(() => {
		setIsResizing(false);
	}, []);

	useEffect(() => {
		window.addEventListener('mousemove', onMouseMove);
		window.addEventListener('mouseup', onMouseUp);

		return () => {
			window.removeEventListener('mousemove', onMouseMove);
			window.removeEventListener('mouseup', onMouseUp);
		};
	}, [onMouseMove, onMouseUp]);

	return (
		<div style={{position: 'relative', display: 'flex', alignItems: 'stretch', borderRight: "1px solid gray",
			borderBottom: "1px solid gray", flexDirection: "column"}}>
			<GlobalStyles styles={{
				'.MuiTreeItem-group': {
					marginLeft: '0px !important',
				},
			}}/>
			<div className="file-sidebar-container"
				 style={{display: "flex", flexDirection: "column", width: width, float: "left", color: "gray", flexGrow: 0, fontSize: "1.3em", overflow: "hidden",
					 alignItems: 'flex-start' }}>
				<div style={{ maxWidth: '300px', width: '100%', borderBottom:"1px solid gray", height: "25px", marginBottom: "10px", marginTop: "23px", display: 'block' }}>
					<FileControlButtons style={{width: "100px"}} />
				</div>
				<TreeView
					style={{ width: `calc(${width}px - 8px)`, marginTop: "-10px", marginLeft: "0px", flexGrow: 0}}
					defaultCollapseIcon={<ExpandMoreIcon style={{flexGrow: 0}} />}
					defaultExpandIcon={<ChevronRightIcon style={{width: "25px", height: "10px", flexGrow: 0}} alt={"chevron-right"}/>}
				>
					{renderTree(fileTree)}
				</TreeView>
			</div>
			<Divider className="sidebar-resizer"
					 onMouseDown={onMouseDown}
					 style={{position: 'absolute', right: 0, height: "100vh", cursor: "col-resize"}} />
		</div>
	);
};

export default FileTree;
