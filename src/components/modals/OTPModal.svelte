<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TextField from '@ui/TextField.svelte';
	import Button from '@ui/Button.svelte';

	export let isOpen = false;
	export let email = '';

	const dispatch = createEventDispatcher();
	let otp = '';

	const handleValidateOTP = () => {
		dispatch('validate', { otp });
	};

	const handleClose = () => {
		dispatch('close');
	};
</script>

{#if isOpen}
	<div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
		<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96">
			<h2 class="text-xl font-semibold mb-4 text-center">Enter OTP</h2>
			<p class="text-center text-gray-600 dark:text-gray-300">
				An OTP has been sent to <strong>{email}</strong>
			</p>

			<div class="my-4">
				<TextField label="OTP" placeholder="Enter 6-digit OTP" bind:value={otp} width="large" />
			</div>

			<div class="flex justify-center space-x-2">
				<Button text="Cancel" style="secondary" on:click={handleClose} />
				<Button text="Validate" style="primary" on:click={handleValidateOTP} />
			</div>
		</div>
	</div>
{/if}
