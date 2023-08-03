import React, {useState, useCallback, useRef } from 'react';
import '../components/style/tabbedStyle.css'
import '../App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../pages/style/developmentPage.css'
import PromptBox from "../components/PromptBox";
import ContextMenu from "../components/ContextMenu";
import {Divider} from "../components/Divider";
import Panel from "../components/Panel";
import Sidebar from "../components/Sidebar";
import TabbedEditor from "../components/TabbedEditor";
import TabbedHelper from "../components/TabbedHelper";


export function DevelopmentPage({language, userId, projectId, projectTree, containerId}) {

	/******************************************* HANDLE PANEL RESIZING *******************************************/
	const [panelWidths, setPanelWidths] = useState({
		leftPercent: 0.5,
		rightPercent: 0.5
	});
	const getPixelWidth = (percentage) => (window.innerWidth - 45) * percentage;

	const onMouseDown = useCallback((e) => {
		if (language === "html") {
			// put shield over iframe so resizing works
			const shield = document.createElement('div');
			shield.id = 'drag-shield';  // So you can find it later
			document.body.appendChild(shield);
		}

		const onMove = (e) => {
			e.preventDefault() // prevent text selection when resizing
			const { movementX } = e;
			setPanelWidths((prevWidths) => {
				const totalWidth = window.innerWidth - 45;
				const newLeftWidth = getPixelWidth(prevWidths.leftPercent) + movementX;
				const newRightWidth = getPixelWidth(prevWidths.rightPercent) - movementX;
				return {
					leftPercent: newLeftWidth / totalWidth,
					rightPercent: newRightWidth / totalWidth
				};
			});
		};

		const onMouseUp = () => {
			window.removeEventListener('mousemove', onMove);
			window.removeEventListener('mouseup', onMouseUp);
			if (language === "html") {
				const shield = document.getElementById('drag-shield');
				if (shield) {
					shield.remove();
				}
			}
		};

		window.addEventListener('mousemove', onMove);
		window.addEventListener('mouseup', onMouseUp);
	}, []);


	/******************************************* HANDLE CONTEXT MENU *******************************************/
	const [menuPosition, setMenuPosition] = useState({x: '0px', y: '0px'});
	const [showMenu, setShowMenu] = useState(false);
	const selectedText = useRef(''); // Using useRef
	const editorRef = useRef(null);

	const handleContextMenu = (event) => {
		event.preventDefault();

		if (editorRef.current) {
			const editor = editorRef.current;
			const selection = editor.state.selection.main;
			const doc = editor.state.doc;

			const low = Math.min(selection.from, selection.to)
			const high = Math.max(selection.from, selection.to)
			// Getting the selected text
			selectedText.current = doc.sliceString(low, high);

			setMenuPosition({ x: `${event.pageX}px`, y: `${event.pageY}px` });
			setShowMenu(true);
		}
	};

	const [promptBoxVisible, setPromptBoxVisible] = useState(false);

	const handlePromptCancel = () => {
		setPromptBoxVisible(false);
	};

	return (
		<div className={'wrapper'} >
			<Sidebar style={{overflow: "hidden"}} projectTree={projectTree} ></Sidebar>
			<PromptBox
				isVisible={promptBoxVisible}
				onCancel={handlePromptCancel}
				position={menuPosition}
				setVisible={setPromptBoxVisible}
				selectedText={selectedText.current}
				editorRef={editorRef}
			/>
			{showMenu && (
				<ContextMenu menuPosition={menuPosition} setPromptBoxVisible={setPromptBoxVisible}
							 onClick={() => setShowMenu(false)} setShowMenu={setShowMenu} showMenu={showMenu}/>
			)}
			<div className={"box"} style={{ width: getPixelWidth(panelWidths.leftPercent) ? `${getPixelWidth(panelWidths.leftPercent)}px` : "100%", margin: "0 auto", height: "100%"}} >

				<TabbedEditor language={language} editorRef={editorRef}
							  handleContextMenu={handleContextMenu} userId={userId}
							  projectId={projectId}
				/>

			</div>
			<Divider onMouseDown={onMouseDown} style={{margin: "0 auto"}} />
			<Panel width={getPixelWidth(panelWidths.rightPercent)}>
				<div className={"panel-content-container"} style={{width: "97.5%", height: "100vh", }}>
					<TabbedHelper language={language} currWidth={getPixelWidth(panelWidths.rightPercent)}
								  containerId={containerId}/>
				</div>
			</Panel>
		</div>
	);
}


