<script lang="ts">
	import Swal from 'sweetalert2';
	import TextField from '@ui/TextField.svelte';
	import Button from '@ui/Button.svelte';

	export let isOpen: boolean;
	export let closeModal: () => void;

	let email = '';

	const handleResetPassword = async () => {
		if (!email.trim()) {
			Swal.fire({
				title: 'Error',
				text: 'Please enter your email address.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
			return;
		}

		try {
			const response = await fetch('http://localhost:3000/api/password/forgot', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email })
			});

			if (!response.ok) {
				const errorData = await response.json();
				Swal.fire({
					title: 'Error',
					text: errorData.error || 'Failed to send reset password email.',
					icon: 'error',
					confirmButtonText: 'OK'
				});
				return;
			}

			Swal.fire({
				title: 'Email Sent',
				text: 'Please check your email for the reset password link.',
				icon: 'success',
				confirmButtonText: 'OK'
			});
			closeModal();
		} catch (error) {
			console.error('Error:', error);
			Swal.fire({
				title: 'Error',
				text: 'An error occurred. Please try again later.',
				icon: 'error',
				confirmButtonText: 'OK'
			});
		}
	};
</script>

{#if isOpen}
	<div class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
		<div class="bg-white dark:bg-dark rounded-lg shadow-lg p-8 w-11/12 max-w-md text-center">
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
			<h2 class="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Forgot password?</h2>
			<p class="text-gray-600 dark:text-gray-400 mb-6">
				No worries, we’ll send you reset instructions.
			</p>

			<form on:submit|preventDefault={handleResetPassword}>
				<div class="mb-4 text-left">
					<TextField
						label="Email"
						placeholder="Enter your email"
						type="email"
						bind:value={email}
						width="large"
					/>
				</div>
				<div class="flex flex-col gap-4">
					<Button text="Reset Password" width="large" style="primary" type="submit" />
					<Button text="&larr; Back to log in" style="ghost" on:click={closeModal} />
				</div>
			</form>
		</div>
	</div>
{/if}
