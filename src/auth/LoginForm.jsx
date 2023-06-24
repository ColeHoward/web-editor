import React, { useCallback } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { debounce } from 'lodash';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';

const theme = createTheme({
	palette: {
		mode: 'dark',
	},
});

// Define the validation schema using Yup
const LoginSchema = Yup.object().shape({
	email: Yup.string()
		.email('Invalid email')
		.required('Required'),
	password: Yup.string()
		.required('Required'),
});

const LoginForm = () => {
	function authenticateCredentials(email, password) {
		// call server to authenticate credentials
		// or I guess Cognito probably does this for you
		return true;
	}
	return (
		<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
			<h2 style={{ color: 'white' }}>Login</h2>
			<Formik
				initialValues={{
					email: '',
					password: '',
				}}
				validationSchema={LoginSchema}
				onSubmit={(values, { setSubmitting }) => {
					// Set a session in localStorage upon successful form submission
					localStorage.setItem('isSignedIn', 'true');
					console.log('Registration successful');
					setSubmitting(false);
				}}
			>
				{({ isSubmitting, errors, touched }) => (
					<Form style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
						<Field name="email">
							{({ field, form }) => (
								<TextField
									{...field}
									error={touched.email && !!errors.email}
									helperText={touched.email && errors.email}
									label="Email"
									variant="outlined"
									style={{ marginBottom: '20px' }}
								/>
							)}
						</Field>
						<Field name="password">
							{({ field, form }) => (
								<TextField
									{...field}
									error={touched.password && !!errors.password}
									helperText={touched.password && errors.password}
									label="Password"
									type="password"
									variant="outlined"
								/>
							)}
						</Field>
						<Button type="submit" disabled={isSubmitting} variant="contained" style={{ marginTop: '20px' }}>
							Submit
						</Button>
					</Form>
				)}
			</Formik>
		</Box>
	);
};

export default LoginForm;
