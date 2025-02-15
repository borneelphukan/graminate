<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import Button from '@ui/Button.svelte';

	export let isOpen = false;
	export let email = '';

	const dispatch = createEventDispatcher();

	let otpDigits = ['', '', '', '', '', ''];

	let inputs: HTMLInputElement[] = [];

	function handleInput(index: number, event: Event) {
		const input = event.target as HTMLInputElement;
		otpDigits[index] = input.value;

		if (input.value.length >= 1 && index < inputs.length - 1) {
			inputs[index + 1]?.focus();
		}
	}

	const handleValidateOTP = () => {
		const otp = otpDigits.join('');
		dispatch('validate', { otp });
	};

	const handleClose = () => {
		dispatch('close');
	};

	onMount(() => {
		inputs[0]?.focus();
	});
</script>

{#if isOpen}
	<div class="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
		<div class="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 w-96">
			<h2 class="text-xl font-semibold mb-4 text-center">Enter OTP</h2>
			<p class="text-center text-gray-600 dark:text-gray-300">
				An OTP has been sent to <strong>{email}</strong>
			</p>

			<div class="flex justify-center space-x-2 my-4">
				{#each otpDigits as digit, index}
					<input
						type="text"
						class="w-12 h-12 text-center border border-gray-300 rounded"
						maxlength="1"
						bind:this={inputs[index]}
						bind:value={otpDigits[index]}
						on:input={(e) => handleInput(index, e)}
					/>
				{/each}
			</div>

			<div class="flex justify-center space-x-2">
				<Button text="Cancel" style="secondary" on:click={handleClose} />
				<Button text="Validate" style="primary" on:click={handleValidateOTP} />
			</div>
		</div>
	</div>
{/if}
