<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Swal from 'sweetalert2';
	import TextField from '@ui/TextField.svelte';
	import Button from '@ui/Button.svelte';
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';

	let email = '';
	let token = '';
	let newPassword = '';
	let confirmPassword = '';

	onMount(() => {
		const urlParams = new URLSearchParams(window.location.search);
		email = urlParams.get('email') || '';
		token = urlParams.get('token') || '';

		console.log('Extracted Email:', email);
		console.log('Extracted Token:', token);

		if (!email || !token) {
			Swal.fire({
				title: 'Invalid Link',
				text: 'This password reset link is invalid or expired.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
			goto('/');
		}
	});

	const handleResetPassword = async () => {
		if (newPassword !== confirmPassword) {
			Swal.fire({
				title: 'Error',
				text: 'Passwords do not match.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
			return;
		}

		const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
		if (!passwordRegex.test(newPassword)) {
			Swal.fire({
				title: 'Weak Password',
				text: 'Password must be at least 8 characters long, contain one uppercase letter, one number, and one special character.',
				icon: 'warning',
				confirmButtonText: 'OK'
			});
			return;
		}

		try {
			const response = await fetch('http://localhost:3000/api/password/reset', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, token, newPassword })
			});

			const result = await response.json();
			if (!response.ok) {
				Swal.fire({
					title: 'Error',
					text: result.error,
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			Swal.fire({
				title: 'Success',
				text: 'Password successfully reset. You can now log in.',
				icon: 'success',
				confirmButtonText: 'OK'
			});
			goto('/');
		} catch (error) {
			console.error(error);
			Swal.fire({
				title: 'Error',
				text: 'Something went wrong. Please try again later.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
		}
	};
</script>

<svelte:head>
	<title>Graminate: Reset Password</title>
</svelte:head>
<HomeNavbar />
<div class="min-h-screen flex items-center justify-center dark:bg-dark bg-light">
	<div class="bg-white shadow-md rounded p-6 w-96">
		<div class="flex justify-center mb-4">
			<div class="bg-gray-500 p-3 rounded-full">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-8 h-8 text-gray-300"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1 1 21.75 8.25Z"
					/>
				</svg>
			</div>
		</div>
		<h2 class="text-2xl font-semibold mb-4 text-center">Reset Account Password</h2>
		<p class="text-gray-600 dark:text-gray-400 mb-6 text-center">
			Enter your new password twice to remember it well
		</p>
		<div class="mb-4 text-left">
			<TextField
				label="New Password"
				placeholder="Enter New Password"
				type="password"
				bind:value={newPassword}
				width="large"
			/>
		</div>

		<div class="mb-4 text-left">
			<TextField
				label="Confirm Password"
				placeholder="Confirm New Password"
				type="password"
				bind:value={confirmPassword}
				width="large"
			/>
		</div>

		<div class="mt-4">
			<Button text="Reset Password" width="large" style="primary" on:click={handleResetPassword} />
		</div>
	</div>
</div>
