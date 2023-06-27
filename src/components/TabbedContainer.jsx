import React, { useState } from 'react';
import {Tab, Box } from '@mui/material';
import TabPanel from '@mui/lab/TabPanel';
import TabList from '@mui/lab/TabList';
import TabContext from '@mui/lab/TabContext';

const TabbedContainer = ({ tabs, children }) => {
	const [value, setValue] = useState(tabs.length > 0 ? tabs[0].props.value : "");
	const handleChange = (event, newValue) => {
		setValue(newValue);
	};

	return (
		<TabContext value={value}>
			<Box sx={{
				borderBottom: 1,
				borderColor: "divider",
				minHeight: "48px",
				display: tabs.length > 0 ? 'block' : 'none'
			}}>
				<TabList onChange={handleChange} variant="standard" scrollButtons="auto" sx={{
					'& .MuiTabs-indicator': {
						backgroundColor: '#89CFEF'
					}
				}}>
					{tabs}
				</TabList>
			</Box>
			{children(value)}
		</TabContext>
	);
};

export default TabbedContainer;
