<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let selectedTime: string = '12:00 PM'; // Default selected time
	const dispatch = createEventDispatcher();

	let hours: number | null = 12; // Selected hour
	let minutes: number | null = 0; // Selected minute
	let period: string = 'AM'; // Default to AM

	function setTime() {
		// Ensure all selections are made
		if (hours === null || minutes === null) {
			alert('Please select hours and minutes before submitting.');
			return;
		}

		selectedTime = `${hours.toString().padStart(2, '0')}:${minutes
			.toString()
			.padStart(2, '0')} ${period}`;
		dispatch('timeSelected', { time: selectedTime });
	}

	function cancel() {
		dispatch('cancel'); // Emit a cancel event
	}
</script>

<div class="clock-picker">
	<h3 class="text-lg font-bold mb-4">Select Time</h3>

	<div class="flex justify-center items-center mb-4">
		<div class="flex items-center space-x-2">
			<!-- Hours -->
			<select bind:value={hours} class="border border-gray-300 rounded p-2 focus:outline-none">
				{#each Array.from({ length: 12 }, (_, i) => i + 1) as h}
					<option value={h}>{h}</option>
				{/each}
			</select>

			<!-- Minutes -->
			<select bind:value={minutes} class="border border-gray-300 rounded p-2 focus:outline-none">
				{#each Array.from({ length: 12 }, (_, i) => i * 5) as m}
					<option value={m}>{m.toString().padStart(2, '0')}</option>
				{/each}
			</select>
			<!-- AM/PM -->
			<select bind:value={period} class="border border-gray-300 rounded p-2 focus:outline-none">
				<option value="AM">AM</option>
				<option value="PM">PM</option>
			</select>
		</div>
	</div>

	<div class="mt-4 flex justify-center space-x-4">
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<button class="bg-green-200 text-white py-2 px-4 rounded hover:bg-green-100" onclick={setTime}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-4"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
			</svg>
		</button>
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<button class="bg-red-200 text-white py-2 px-4 rounded hover:bg-red-100" onclick={cancel}>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="1.5"
				stroke="currentColor"
				class="size-4"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
			</svg>
		</button>
	</div>
</div>

<style>
	.clock-picker {
		background: white;
		padding: 1rem;
		border-radius: 0.5rem;
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
		max-width: 100%; /* Prevent horizontal overflow */
		max-height: 100%; /* Prevent vertical overflow */
		overflow: auto; /* Add scroll if content overflows */
		position: relative;
	}

	.clock-picker h3 {
		word-wrap: break-word;
	}

	@media (max-width: 768px) {
		.clock-picker {
			padding: 0.5rem;
		}
	}
</style>
