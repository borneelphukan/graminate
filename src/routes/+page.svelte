<script lang="ts">
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import Swal from 'sweetalert2';
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';
	import Footer from '@layout/Footer.svelte';
	import TextField from '@ui/TextField.svelte';
	import Button from '@ui/Button.svelte';

	let isLogin = writable(true);
	let loginData = {
		email: '',
		password: ''
	};
	let registerData = {
		first_name: '',
		last_name: '',
		email: '',
		phone_number: '',
		business_name: '',
		date_of_birth: '',
		password: ''
	};

	let fieldErrors = {
		first_name: false,
		last_name: false,
		email: false,
		phone_number: false,
		date_of_birth: false,
		password: false
	};

	let loginErrorMessage = '';
	let emailErrorMessage = 'This cannot be left blank';
	let phoneErrorMessage = 'This cannot be left blank';
	let passwordErrorMessage = '';

	const toggleForm = () => {
		isLogin.update((value) => !value);
	};

	const validatePassword = (password: string): boolean => {
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
		return passwordRegex.test(password);
	};

	const validateEmail = (email: string): boolean => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	};

	const validatePhoneNumber = (phone: string): boolean => {
		const phoneRegex = /^\+?[1-9]\d{1,14}$/;
		return phoneRegex.test(phone);
	};

	const handleLogin = async (event: Event) => {
		event.preventDefault();

		loginErrorMessage = '';

		if (!loginData.email.trim() || !loginData.password.trim()) {
			loginErrorMessage = 'Email and password are required.';
			return;
		}

		try {
			const response = await fetch('http://localhost:3000/api/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(loginData),
				credentials: 'include' // Ensure cookies are sent with the request
			});

			if (!response.ok) {
				const errorData = await response.json();
				Swal.fire({
					title: 'Login Failed',
					text: errorData.error || 'Invalid email or password.',
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			const responseData = await response.json();

			// Navigate to /platform/[user_id]
			goto(`/platform/${responseData.user.user_id}`);
		} catch (error) {
			console.error('Error during login:', error);
			Swal.fire({
				title: 'Error',
				text: 'An error occurred. Please try again later.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
		}
	};

	const handleRegister = async (event: Event) => {
		event.preventDefault();

		// Reset field errors
		fieldErrors = {
			first_name: false,
			last_name: false,
			email: false,
			phone_number: false,
			date_of_birth: false,
			password: false
		};
		emailErrorMessage = 'This cannot be left blank';
		phoneErrorMessage = 'This cannot be left blank';
		passwordErrorMessage = '';

		// Validate form fields
		let hasError = false;

		if (!registerData.first_name.trim()) {
			fieldErrors.first_name = true;
			hasError = true;
		}
		if (!registerData.last_name.trim()) {
			fieldErrors.last_name = true;
			hasError = true;
		}
		if (!validateEmail(registerData.email)) {
			fieldErrors.email = true;
			emailErrorMessage = 'Enter a valid email ID';
			hasError = true;
		}
		if (!validatePhoneNumber(registerData.phone_number)) {
			fieldErrors.phone_number = true;
			phoneErrorMessage = 'Enter valid phone number';
			hasError = true;
		}
		if (!registerData.date_of_birth.trim()) {
			fieldErrors.date_of_birth = true;
			hasError = true;
		}
		if (!validatePassword(registerData.password)) {
			fieldErrors.password = true;
			passwordErrorMessage =
				'Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character.';
			hasError = true;
		}

		if (hasError) {
			return;
		}

		try {
			const response = await fetch('http://localhost:3000/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(registerData)
			});

			if (response.status === 409) {
				Swal.fire({
					title: 'User already exists',
					text: 'Please use a different email or phone number.',
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			if (!response.ok) {
				const errorData = await response.json();
				console.error('Error:', errorData);
				Swal.fire({
					title: 'Error',
					text: errorData.message || 'Something went wrong.',
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			Swal.fire({
				title: 'Registration Successful!',
				text: 'You can now log in.',
				icon: 'success',
				confirmButtonText: 'OK'
			});
			toggleForm();
		} catch (error) {
			console.error('Error during registration:', error);
			Swal.fire({
				title: 'Error',
				text: 'An error occurred. Please try again later.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
		}
	};
</script>

<svelte:head>
	<title>Welcome to Graminate: Manage your Agricultural Budget</title>
</svelte:head>

<HomeNavbar />
<div class="min-h-screen flex flex-col md:flex-row">
	<!-- Left Image Section -->
	<div
		class="hidden md:block md:w-3/4 h-screen bg-cover bg-center"
		style="background-image: url('/images/cover.png');"
	></div>

	<!-- Right Form Section -->
	<div
		class="w-full md:w-1/2 flex items-center justify-center min-h-screen bg-cover bg-center md:bg-none"
	>
		<div class="bg-white shadow-md rounded px-8 py-6 w-11/12 max-w-md">
			{#if $isLogin}
				<h2 class="text-2xl font-semibold mb-6 text-center">Login</h2>
				<form on:submit={handleLogin}>
					<div class="mb-4">
						<TextField
							label="Email"
							placeholder="Enter your email"
							type="text"
							bind:value={loginData.email}
							width="large"
						/>
					</div>
					<div class="mb-6">
						<TextField
							label="Password"
							placeholder="Enter your password"
							password={true}
							type="password"
							bind:value={loginData.password}
							width="large"
						/>
					</div>
					{#if loginErrorMessage}
						<p class="text-red-500 text-sm mb-4">{loginErrorMessage}</p>
					{/if}
					<div class="mx-auto flex flex-row justify-center">
						<Button text="Login" width="large" style="primary" type="submit" />
					</div>
				</form>
				<p class="text-center mt-4 text-sm text-gray-600">
					Don't have an account?{' '}
					<button class="text-blue-500 hover:underline focus:outline-none" on:click={toggleForm}>
						Sign Up
					</button>
				</p>
				<!-- Registration Form -->
			{:else}
				<h2 class="text-2xl font-semibold mb-6 text-center">Sign Up</h2>
				<form on:submit={handleRegister}>
					<div class="flex flex-row gap-2">
						<div class="mb-4">
							<TextField
								label="First Name"
								placeholder="Enter your First Name"
								type={fieldErrors.first_name ? 'error' : ''}
								bind:value={registerData.first_name}
								width="large"
							/>
						</div>
						<div class="mb-4">
							<TextField
								label="Last Name"
								placeholder="Enter your Last Name"
								type={fieldErrors.last_name ? 'error' : ''}
								bind:value={registerData.last_name}
								width="large"
							/>
						</div>
					</div>

					<div class="mb-4">
						<TextField
							label="Email"
							placeholder="Enter your Email"
							type={fieldErrors.email ? 'error' : ''}
							bind:value={registerData.email}
							error_message={emailErrorMessage}
							width="large"
						/>
					</div>
					<div class="mb-4">
						<TextField
							label="Phone Number"
							placeholder="Enter your Phone Number"
							type={fieldErrors.phone_number ? 'error' : ''}
							bind:value={registerData.phone_number}
							error_message={phoneErrorMessage}
							width="large"
						/>
					</div>
					<div class="mb-4">
						<TextField
							label="Business Name (optional)"
							placeholder="Enter name of your Farm Business"
							bind:value={registerData.business_name}
							width="large"
						/>
					</div>
					<div class="mb-4">
						<TextField
							label="Date of Birth"
							placeholder="YYYY-MM-DD"
							type={fieldErrors.date_of_birth ? 'error' : ''}
							bind:value={registerData.date_of_birth}
							width="large"
							calendar
						/>
					</div>
					<div class="mb-4">
						<TextField
							label="Password"
							placeholder="Enter your password"
							password={true}
							bind:value={registerData.password}
							width="large"
							type={fieldErrors.password ? 'error' : ''}
							error_message={passwordErrorMessage}
						/>
					</div>

					<div class="mx-auto flex flex-row justify-center">
						<Button text="Sign Up" width="large" style="primary" type="submit" />
					</div>
				</form>
				<p class="text-center mt-4 text-sm text-gray-600">
					Already have an account?{' '}
					<button class="text-blue-500 hover:underline focus:outline-none" on:click={toggleForm}>
						Login
					</button>
				</p>
			{/if}
		</div>
	</div>
</div>
<Footer />
