<script lang="ts">
	import { writable } from 'svelte/store';
	import { fly } from 'svelte/transition';
	import TextField from '../ui/TextField.svelte';
	import Dropdown from '../ui/Dropdown.svelte';
	import Button from '../ui/Button.svelte';

	export let view: string;
	export let onClose: () => void;
	export let onSubmit: (values: Record<string, string>) => void = () => {
		console.warn('onSubmit is not provided');
	};

	let contactValues = writable<Record<string, string>>({
		firstName: '',
		lastName: '',
		email: '',
		phoneNumber: '',
		type: ''
	});

	let companyValues = writable<Record<string, string>>({
		companyName: '',
		companyOwner: '',
		industry: '',
		type: '',
		city: '',
		state: ''
	});

	let ticketValues = writable<Record<string, string>>({
		ticketName: '',
		category: '',
		status: '',
		industry: '',
		type: '',
		city: '',
		state: ''
	});

	const contactTypes = [
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

	const companyType = ['Supplier', 'Distributor', 'Factories', 'Buyer'];
	const ticketStatus = ['Open', 'In Progress', 'Completed', 'On Hold', 'Cancelled'];

	function handleSubmitContacts() {
		contactValues.subscribe((values) => {
			onSubmit(values);
			console.log('Contact Form Submitted:', values);
		})();
	}

	function handleSubmitCompanies() {
		companyValues.subscribe((values) => {
			onSubmit(values);
			console.log('Company Form Submitted:', values);
		})();
	}

	function handleSubmitTickets() {
		ticketValues.subscribe((values) => {
			onSubmit(values);
			console.log('Ticket Form Submitted:', values);
		})();
	}

	function handleClose() {
		onClose();
	}
</script>

<!-- Sidebar Container -->
<div
	class="fixed top-0 right-0 h-full w-full md:w-1/3 bg-white shadow-lg z-50"
	transition:fly={{ x: 500, duration: 300 }}
>
	<div class="p-6 flex flex-col h-full">
		<div class="flex justify-between items-center mb-4">
			<h2 class="text-xl font-semibold text-gray-700">
				Create {view.charAt(0).toUpperCase() + view.slice(1)}
			</h2>
			<button class="text-gray-400 hover:text-gray-600" on:click={handleClose}>✕</button>
		</div>

		<!-- Form for Contacts -->
		{#if view === 'contacts'}
			<form
				class="flex flex-col gap-4 w-full flex-grow"
				on:submit|preventDefault={handleSubmitContacts}
			>
				<TextField
					label="First Name"
					placeholder="e.g. John"
					type="text"
					bind:value={$contactValues.firstName}
				/>
				<TextField
					label="Last Name"
					placeholder="e.g. Doe"
					type="text"
					bind:value={$contactValues.lastName}
				/>
				<TextField
					label="Email"
					placeholder="e.g. john.doe@gmail.com"
					type="email"
					bind:value={$contactValues.email}
				/>
				<TextField
					label="Phone Number"
					placeholder="e.g. +91 XXXXX XXX XX"
					type="tel"
					bind:value={$contactValues.phoneNumber}
				/>
				<Dropdown
					items={contactTypes}
					bind:selectedItem={$contactValues.type}
					type="form"
					label="Type"
					width="full"
				/>
				<div class="flex justify-end gap-4 mt-2">
					<Button text="Create" style="primary" on:click={handleSubmitContacts} />
					<Button text="Cancel" style="secondary" on:click={handleClose} />
				</div>
			</form>
		{/if}

		<!-- Form for Companies -->
		{#if view === 'companies'}
			<form
				class="flex flex-col gap-4 w-full flex-grow"
				on:submit|preventDefault={handleSubmitCompanies}
			>
				<TextField
					label="Company Name"
					placeholder="Enter company name"
					type="text"
					bind:value={$companyValues.companyName}
				/>
				<TextField
					label="Company Representative"
					placeholder="e.g. John Doe"
					type="text"
					bind:value={$companyValues.companyOwner}
				/>
				<TextField
					label="Industry"
					placeholder="Enter industry"
					type="text"
					bind:value={$companyValues.industry}
				/>
				<Dropdown
					items={companyType}
					bind:selectedItem={$companyValues.type}
					type="form"
					label="Type"
					width="full"
				/>
				<TextField
					label="City"
					placeholder="Enter city"
					type="text"
					bind:value={$companyValues.city}
				/>
				<TextField
					label="State/Region"
					placeholder="Enter state/region"
					type="text"
					bind:value={$companyValues.state}
				/>
				<div class="flex justify-end gap-4 mt-2">
					<Button text="Create" style="primary" on:click={handleSubmitCompanies} />
					<Button text="Cancel" style="secondary" on:click={handleClose} />
				</div>
			</form>
		{/if}

		<!-- Form for Tickets -->
		{#if view === 'tickets'}
			<form
				class="flex flex-col gap-4 w-full flex-grow"
				on:submit|preventDefault={handleSubmitTickets}
			>
				<TextField
					label="Ticket Name"
					placeholder="e.g. Name of the task"
					type="text"
					bind:value={$ticketValues.ticketName}
				/>
				<TextField
					label="Work Category"
					placeholder="e.g. Your work"
					type="text"
					bind:value={$ticketValues.category}
				/>
				<Dropdown
					items={ticketStatus}
					bind:selectedItem={$ticketValues.status}
					type="form"
					label="Ticket Status"
					width="full"
				/>
				<TextField
					label="Industry"
					placeholder="Enter industry"
					type="text"
					bind:value={$ticketValues.industry}
				/>
				<Dropdown
					items={contactTypes}
					bind:selectedItem={$ticketValues.type}
					type="form"
					label="Type"
					width="full"
				/>
				<TextField
					label="City"
					placeholder="Enter city"
					type="text"
					bind:value={$ticketValues.city}
				/>
				<TextField
					label="State/Region"
					placeholder="Enter state/region"
					type="text"
					bind:value={$ticketValues.state}
				/>
				<div class="flex justify-end gap-4 mt-2">
					<Button text="Create" style="primary" on:click={handleSubmitTickets} />
					<Button text="Cancel" style="secondary" on:click={handleClose} />
				</div>
			</form>
		{/if}
	</div>
</div>
