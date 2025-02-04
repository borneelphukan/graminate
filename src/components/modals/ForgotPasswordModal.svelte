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
		<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 max-w-md">
			<h2 class="text-2xl font-semibold mb-6 text-center dark:text-light">Forgot Password</h2>
			<form on:submit|preventDefault={handleResetPassword}>
				<div class="mb-4">
					<TextField
						label="Email"
						placeholder="Enter your email"
						type="text"
						bind:value={email}
						width="large"
					/>
				</div>
				<div class="flex justify-end gap-4">
					<Button text="Cancel" width="medium" style="secondary" on:click={closeModal} />
					<Button text="Reset" width="medium" style="primary" type="submit" />
				</div>
			</form>
		</div>
	</div>
{/if}
