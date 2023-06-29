import React from 'react'

export default function SendIcon({ idSuffix, style, onClick }) {
	return (
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50" fill="#61dafb"
			 height= {style.height} width={style.width} onClick={onClick} cursor={"pointer"}>
			<defs>
				<marker id={`arrowhead-${idSuffix}`} markerWidth="10" markerHeight="7"
						refX="0" refY="3.5" orient="auto">
					<polygon points="0 1, 4 3.5, 0 6" />
				</marker>
			</defs>
			<polyline points="10 10, 10 30, 30 30" fill="none" stroke="#61dafb"
					  strokeWidth="5" markerEnd={`url(#arrowhead-${idSuffix})`} />
		</svg>
	)
}
