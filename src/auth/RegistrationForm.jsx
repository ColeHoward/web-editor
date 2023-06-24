import React, { useCallback } from 'react';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { debounce } from 'lodash';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { Box } from '@mui/system';
import {emailIsNew} from './authUtils';


// Define the validation schema using Yup
const RegistrationSchema = Yup.object().shape({
	email: Yup.string()
		.email('Invalid email')
		.required('Required')
		.test(
			'emailIsNew',
			'Email already in use',
			async value => {
				try {
					const isNew = await debounce(emailIsNew(value), 500);
					return isNew;
				} catch (error) {
					console.error('Error checking email:', error);
					return false;
				}
			}
		),
	password: Yup.string()
		.min(12, 'Password must be at least 12 characters')
		.matches(/[a-z]/, 'Password must contain at least one lowercase char')
		.matches(/[A-Z]/, 'Password must contain at least one uppercase char')
		.matches(/[0-9]+/, 'Password must contains at least one number.')
		.matches(/[!@#$%^&*()]+/, 'Password must contains at least one special char (@, #, $, %, ^, &, *, ()).')
		.required('Required'),
	confirmPassword: Yup.string()
		.oneOf([Yup.ref('password'), null], 'Passwords must match')
		.required('Confirm Password is required'),
});

const RegistrationForm = () => {
	const checkEmailIsNew = useCallback(
		debounce(async (email) => {
			// Assuming emailIsNew(email) returns a Promise that resolves to true or false
			return await emailIsNew(email);
		}, 500),
		[] // Dependencies for useCallback
	);

	return (
			<Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
				<h2 style={{ color: 'white' }}>Register</h2>
				<Formik
					initialValues={{
						email: '',
						password: '',
						confirmPassword: '',
					}}
					validationSchema={RegistrationSchema}
					onSubmit={(values, { setSubmitting }) => {
						// Set a session in localStorage upon successful form submission
						localStorage.setItem('isSignedIn', true);
						console.log('Registration successful');
						setSubmitting(false);
					}}
				>
					{({ isSubmitting, errors, touched }) => (
						<Form style={{ width: '300px', display: 'flex', flexDirection: 'column' }}>
							<Field name="email">
								{({ field }) => (
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
								{({ field }) => (
									<TextField
										{...field}
										error={touched.password && !!errors.password}
										helperText={touched.password && errors.password}
										label="Password"
										type="password"
										variant="outlined"
										style={{ marginBottom: '20px' }}
									/>
								)}
							</Field>
							<Field name="confirmPassword">
								{({ field, form }) => (
									<TextField
										{...field}
										error={touched.confirmPassword && !!errors.confirmPassword}
										helperText={touched.confirmPassword && errors.confirmPassword}
										label="Confirm Password"
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

export default RegistrationForm;
