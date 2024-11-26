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

	export let view: string;
	export let onClose: () => void;
	export let onSubmit: (values: Record<string, string>) => void;

	type FormElementEvents = {
		submit: Record<string, string>;
		close: void;
	};

	const dispatch = createEventDispatcher<FormElementEvents>();
	let fieldValues = writable<Record<string, string>>({});

	const fieldsMap: Record<string, Field[]> = {
		contacts: [
			{ id: 'firstName', label: 'First Name', placeholder: 'e.g. John', type: 'text' },
			{ id: 'lastName', label: 'Last Name', placeholder: 'e.g. Doe', type: 'text' },
			{ id: 'email', label: 'Email', placeholder: 'e.g. john.doe@gmail.com', type: 'email' },
			{ id: 'phoneNumber', label: 'Phone Number', placeholder: 'e.g. +91 XXXXX XXX XX', type: 'tel' },
			{ id: 'type', label: 'Type', placeholder: 'Select type', type: 'dropdown' }
		],
		companies: [
			{ id: 'companyName', label: 'Company Name', placeholder: 'Enter company name', type: 'text' },
			{ id: 'companyOwner', label: 'Company Representative', placeholder: 'e.g. John Doe', type: 'text' },
			{ id: 'industry', label: 'Industry', placeholder: 'Enter industry', type: 'text' },
			{ id: 'type', label: 'Type', placeholder: 'Select type', type: 'dropdown' },
			{ id: 'city', label: 'City', placeholder: 'Enter city', type: 'text' },
			{ id: 'state', label: 'State/Region', placeholder: 'Enter state/region', type: 'text' }
		],
		tickets: [
			{ id: 'domainName', label: 'Company Domain Name', placeholder: 'Enter domain', type: 'text' },
			{ id: 'ticketName', label: 'Ticket Name', placeholder: 'Enter ticket name', type: 'text' },
			{ id: 'companyOwner', label: 'Company Owner', placeholder: 'Enter owner', type: 'text' },
			{ id: 'industry', label: 'Industry', placeholder: 'Enter industry', type: 'text' },
			{ id: 'type', label: 'Type', placeholder: 'Select type', type: 'dropdown' },
			{ id: 'city', label: 'City', placeholder: 'Enter city', type: 'text' },
			{ id: 'state', label: 'State/Region', placeholder: 'Enter state/region', type: 'text' }
		]
	};

	$: fieldValues.set(
		fieldsMap[view]?.reduce((acc, field) => {
			acc[field.id] = field.value || '';
			return acc;
		}, {} as Record<string, string>) || {}
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
			onSubmit(values);
			dispatch('submit', values);
		})();
	}

	function handleClose() {
		onClose();
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
			<h2 class="text-xl font-semibold text-gray-700">Create {view.charAt(0).toUpperCase() + view.slice(1)}</h2>
			<button class="text-gray-400 hover:text-gray-600" on:click={handleClose}>✕</button>
		</div>

		<form class="flex flex-col gap-4 w-full flex-grow" on:submit|preventDefault={handleSubmit}>
			{#each fieldsMap[view] || [] as field}
				{#if field.type === 'dropdown'}
					<Dropdown
						items={typeOptions}
						bind:selectedItem={$fieldValues[field.id]}
						type="form"
						label={field.label}
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

		<div class="flex justify-end gap-4 mt-2">
			<Button text="Create" style="primary" on:click={handleSubmit} />
			<Button text="Cancel" style="secondary" on:click={handleClose} />
		</div>
	</div>
</div>
