<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Swal from 'sweetalert2';
	import TextField from '@ui/TextField.svelte';
	import Button from '@ui/Button.svelte';

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

<div class="min-h-screen flex items-center justify-center dark:bg-dark bg-light">
	<div class="bg-white shadow-md rounded p-6 w-96">
		<h2 class="text-2xl font-semibold mb-4 text-center">Reset Password</h2>
		<TextField
			label="New Password"
			placeholder="Enter new password"
			type="password"
			bind:value={newPassword}
			width="large"
		/>
		<TextField
			label="Confirm Password"
			placeholder="Confirm new password"
			type="password"
			bind:value={confirmPassword}
			width="large"
		/>
		<div class="mt-4">
			<Button text="Reset Password" width="large" style="primary" on:click={handleResetPassword} />
		</div>
	</div>
</div>
