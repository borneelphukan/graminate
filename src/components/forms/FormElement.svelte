<script lang="ts">
	import { writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import TextField from '../ui/TextField.svelte';
	import Button from '../ui/Button.svelte';

	// Type for a field definition
	type Field = {
		id: string;
		label: string;
		placeholder: string;
		type: string;
		value?: string;
		isDisabled?: boolean;
	};

	// Props
	export let fields: Field[] = []; // Dynamic fields for the form
	export let title: string = 'Create'; // Title of the form

	// Create a dispatcher for emitting custom events
	const dispatch = createEventDispatcher();

	// Type definition for field values
	type FieldValues = Record<string, string>;

	// Writable store to manage field values dynamically
	let fieldValues = writable<FieldValues>({});

	// Initialize field values dynamically from fields prop
	$: fieldValues.set(
		fields.reduce((acc: FieldValues, field) => {
			acc[field.id] = field.value || '';
			return acc;
		}, {})
	);

	// Function to handle form submission
	function handleSubmit() {
		fieldValues.subscribe((values) => {
			console.log('Form Submitted:', values);
			dispatch('submit', values); // Emit the submit event with form data
		})();
	}

	// Function to handle sidebar close
	function handleClose() {
		dispatch('close'); // Emit the close event
	}
</script>

<!-- Sidebar Container -->
<div
	class="fixed top-0 right-0 h-full w-full md:w-1/3 bg-white shadow-lg z-50"
	transition:fly={{ x: 500, duration: 300 }}
>
	<div class="p-6 flex flex-col h-full">
		<!-- Header -->
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold text-gray-700">{title}</h2>
			<button class="text-gray-400 hover:text-gray-600" on:click={handleClose}> ✕ </button>
		</div>

		<!-- Form -->
		<form class="flex flex-col gap-4 flex-grow" on:submit|preventDefault={handleSubmit}>
			{#each fields as field}
				<TextField
					label={field.label}
					placeholder={field.placeholder}
					type={field.type === 'disabled' ? 'disabled' : 'default'}
					isDisabled={field.isDisabled || false}
					bind:value={$fieldValues[field.id]}
				/>
			{/each}
		</form>

		<!-- Actions -->
		<div class="flex justify-end gap-4 mt-2">
			<!-- Submit Button -->
			<Button text="Create" style="primary" on:click={handleSubmit} />
			<!-- Cancel Button -->
			<Button text="Cancel" style="secondary" on:click={handleClose} />
		</div>
	</div>
</div>
