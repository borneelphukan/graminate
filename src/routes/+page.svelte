<script lang="ts">
	import { goto } from '$app/navigation';
	import { writable } from 'svelte/store';
	import Swal from 'sweetalert2';
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';
	import Footer from '@layout/Footer.svelte';
	import TextField from '@ui/TextField.svelte';
	import Button from '@ui/Button.svelte';
	import ForgotPasswordModal from '@modals/ForgotPasswordModal.svelte';
	import OTPModal from '@modals/OTPModal.svelte';

	let isOtpModalOpen = false;
	let userEmailForOtp = '';

	let isForgotPasswordModalOpen = false;

	const openForgotPasswordModal = () => {
		loginErrorMessage = '';
		isForgotPasswordModalOpen = true;
	};

	const closeForgotPasswordModal = () => {
		isForgotPasswordModalOpen = false;
	};

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

		// Check if the event was triggered by the Forgot Password link
		const target = event.target as HTMLElement;
		if (
			target.tagName === 'BUTTON' &&
			target.getAttribute('on:click') === 'openForgotPasswordModal'
		) {
			return;
		}

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

		// Reset field errors and perform your validation (existing code) ...

		let hasError = false;
		// ... perform validation on registerData and update fieldErrors ...
		if (hasError) return;

		// Save the email for OTP
		userEmailForOtp = registerData.email;

		try {
			// Call the OTP endpoint (using the new /validation route)
			const otpResponse = await fetch('http://localhost:3000/validation/send-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: userEmailForOtp })
			});

			if (!otpResponse.ok) {
				Swal.fire({
					title: 'Error',
					text: 'Failed to send OTP. Please try again.',
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			// Open the OTP modal for the user to input the received OTP
			isOtpModalOpen = true;
		} catch (error) {
			console.error('Error sending OTP:', error);
			Swal.fire({
				title: 'Error',
				text: 'An error occurred while sending OTP.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
		}
	};

	const handleOtpValidation = async (event: CustomEvent<{ otp: string }>) => {
		const enteredOtp = event.detail.otp;
		try {
			const verifyResponse = await fetch('http://localhost:3000/validation/verify-otp', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: userEmailForOtp, otp: enteredOtp })
			});
			const verifyData = await verifyResponse.json();

			if (!verifyResponse.ok || !verifyData.success) {
				Swal.fire({
					title: 'Invalid OTP',
					text: 'The OTP entered is incorrect. Please try again.',
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			// If OTP is valid, proceed with the final registration request:
			const registerResponse = await fetch('http://localhost:3000/api/register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(registerData)
			});

			if (registerResponse.status === 409) {
				Swal.fire({
					title: 'User already exists',
					text: 'Please use a different email or phone number.',
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			if (!registerResponse.ok) {
				const errorData = await registerResponse.json();
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

			// Close OTP modal and toggle to login view if needed
			isOtpModalOpen = false;
			toggleForm();
		} catch (error) {
			console.error('Error during OTP validation and registration:', error);
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
<div class="min-h-screen dark:bg-gray-900 flex flex-col md:flex-row">
	<!-- Left Image Section -->
	<div
		class="hidden md:block md:w-3/4 h-screen bg-cover bg-center"
		style="background-image: url('/images/cover.png');"
	></div>

	<!-- Right Form Section -->
	<div
		class="w-full md:w-1/2 flex items-center justify-center min-h-screen bg-cover bg-center md:bg-none"
	>
		<div class="bg-white dark:bg-gray-800 shadow-md rounded px-8 py-6 w-11/12 max-w-md">
			{#if $isLogin}
				<h2 class="text-2xl font-semibold mb-6 text-center dark:text-light">Login</h2>
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
					<p class="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
						<button
							class="text-blue-500 hover:underline focus:outline-none"
							on:click={openForgotPasswordModal}
						>
							Forgot Password?
						</button>
					</p>
				</form>
				<p class="text-center mt-4 text-sm text-gray-600 dark:text-gray-300">
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

<ForgotPasswordModal isOpen={isForgotPasswordModalOpen} closeModal={closeForgotPasswordModal} />
<OTPModal
	isOpen={isOtpModalOpen}
	email={userEmailForOtp}
	on:validate={handleOtpValidation}
	on:close={() => (isOtpModalOpen = false)}
/>
