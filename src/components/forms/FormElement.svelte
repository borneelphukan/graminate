<script lang="ts">
	import { writable } from 'svelte/store';
	import { createEventDispatcher } from 'svelte';
	import { fly } from 'svelte/transition';
	import TextField from '../ui/TextField.svelte';
	import Dropdown from '../ui/Dropdown.svelte';
	import Button from '../ui/Button.svelte';

	type Field = {
		id: string;
		label: string;
		placeholder: string;
		type: string;
		value?: string;
		isDisabled?: boolean;
	};

	export let fields: Field[] = [];
	export let title: string = 'Create';
	export let view: string = ''; // Add the view prop

	const dispatch = createEventDispatcher();

	type FieldValues = Record<string, string>;

	let fieldValues = writable<FieldValues>({});

	$: fieldValues.set(
		fields.reduce((acc: FieldValues, field) => {
			acc[field.id] = field.value || '';
			return acc;
		}, {})
	);

	const typeOptions = [
		'Mandi',
		'Trader',
		'Cooperative',
		'Government',
		'Exporter',
		'Industry',
		'Retailer',
		'Vendor',
		'NGO'
	];

	function handleSubmit() {
		fieldValues.subscribe((values) => {
			console.log('Form Submitted:', values);
			dispatch('submit', values);
		})();
	}

	function handleClose() {
		dispatch('close');
	}
</script>

<!-- Sidebar Container -->
<div
	class="fixed top-0 right-0 h-full w-full md:w-1/3 bg-white shadow-lg z-50"
	transition:fly={{ x: 500, duration: 300 }}
>
	<div class="p-6 flex flex-col h-full">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold text-gray-700">{title}</h2>
			<button class="text-gray-400 hover:text-gray-600" on:click={handleClose}> ✕ </button>
		</div>
		<form class="flex flex-col gap-4 w-full flex-grow" on:submit|preventDefault={handleSubmit}>
			{#each fields as field}
				{#if view === 'contacts' && field.id === 'type'}
					<Dropdown
						items={typeOptions}
						bind:selectedItem={$fieldValues[field.id]}
						type="form"
						label="Contact Type"
						width="full"
					/>
				{:else}
					<TextField
						label={field.label}
						placeholder={field.placeholder}
						type={field.type === 'disabled' ? 'disabled' : 'default'}
						isDisabled={field.isDisabled || false}
						bind:value={$fieldValues[field.id]}
					/>
				{/if}
			{/each}
		</form>

		<!-- Actions -->
		<div class="flex justify-end gap-4 mt-2">
			<Button text="Create" style="primary" on:click={handleSubmit} />
			<Button text="Cancel" style="secondary" on:click={handleClose} />
		</div>
	</div>
</div>
