import {styled} from "@stitches/react";


export const Divider = styled("div", {
	position: "relative",
	height: "100%",
	"&:after": {
		content: "",
		position: "absolute",
		top: 0,
		bottom: 0,
		width: "6px",
		cursor: "col-resize",
		zIndex: 100
	},

	"&:hover": {
		"&:after": {
			background: "#89CFEF"
		}
	},
	"&:active": {
		"&:after": {
			background: "#89CFEF"
		}
	},
});