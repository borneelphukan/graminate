<script lang="ts">
	import { page } from '$app/stores';
	import { writable, derived, type Writable, type Readable } from 'svelte/store';
	import Button from '@ui/Button.svelte';
	import SearchDropdown from '@ui/SearchDropdown.svelte';
	import FormElement from '@forms/FormElement.svelte';
	import Table from '@tables/Table.svelte';
	import { goto } from '$app/navigation';

	let userId = $page.params.user_id;

	const isSidebarOpen = writable(false);

	function openSidebar() {
		isSidebarOpen.set(true);
	}

	function closeSidebar() {
		isSidebarOpen.set(false);
	}

	// function navigateToView(view: string) {
	// 	const url = new URL(window.location.href);
	// 	url.searchParams.set('view', view);
	// 	window.location.href = url.toString();
	// 	dropdownOpen = false;
	// }

	type View = 'contacts' | 'companies' | 'deals' | 'invoices' | 'tickets';

	let dropdownOpen = false;

	const dropdownItems = [
		{ label: 'Contacts', view: 'contacts' },
		{ label: 'Companies', view: 'companies' },
		{ label: 'Deals', view: 'deals' },
		{ label: 'Invoices', view: 'invoices' },
		{ label: 'Tickets', view: 'tickets' }
	];

	function navigateTo(view: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('view', view);
		window.location.href = url.toString();
		dropdownOpen = false;
	}

	// const filtersMap: Record<View, { label: string; view: string }[]> = {
	// 	contacts: [
	// 		{ label: 'All Contacts', view: 'contacts' },
	// 		{ label: 'Private Contacts', view: 'private' },
	// 		{ label: 'Business Contacts', view: 'business' },
	// 		{ label: 'All Customers', view: 'customers' }
	// 	],
	// 	companies: [
	// 		{ label: 'All Companies', view: 'companies' },
	// 		{ label: 'Active Companies', view: 'active-companies' },
	// 		{ label: 'Inactive Companies', view: 'inactive-companies' }
	// 	],
	// 	deals: [
	// 		{ label: 'All Deals', view: 'deals' },
	// 		{ label: 'Open Deals', view: 'open-deals' },
	// 		{ label: 'Closed Deals', view: 'closed-deals' }
	// 	],
	// 	invoices: [
	// 		{ label: 'All Invoices', view: 'invoices' },
	// 		{ label: 'Paid Invoices', view: 'paid-invoices' },
	// 		{ label: 'Unpaid Invoices', view: 'unpaid-invoices' }
	// 	],
	// 	tickets: [
	// 		{ label: 'All Tickets', view: 'tickets' },
	// 		{ label: 'My Open Tickets', view: 'open-tickets' },
	// 		{ label: 'Unassigned Tickets', view: 'unassigned-tickets' },
	// 		{ label: 'Finished Tickets', view: 'finished-tickets' }
	// 	]
	// };

	const view = derived(page, ($page) => ($page.url.searchParams.get('view') as View) || 'contacts');
	// const writableFilters = writable(filtersMap['contacts']);
	// view.subscribe(($view) => writableFilters.set([...filtersMap[$view]]));

	const currentPage: Writable<number> = writable(1);
	const itemsPerPage: Writable<number> = writable(25);
	const paginationItems: string[] = ['25 per page', '50 per page', '100 per page'];

	const searchQuery: Writable<string> = writable('');

	const data: Readable<{ columns: string[]; rows: any[][] }> = derived(view, ($view) => {
		switch ($view) {
			case 'contacts':
				return {
					columns: [
						'First Name',
						'Last Name',
						'Email',
						'Phone Number',
						'Type',
						'Address',
						'Created / Updated On'
					],
					rows: [
						[
							'John ',
							'Doe',
							'john.doe@example.com',
							'+123456789',
							'Customer',
							'123 Main St',
							'23-06-2024'
						],
						[
							'Jane',
							'Smith',
							'jane.smith@example.com',
							'+987654321',
							'Subscriber',
							'456 Elm St',
							'23-06-2024'
						]
					]
				};
			case 'companies':
				return {
					columns: ['Company Name', 'Owner Name', 'Email', 'Phone Number', 'Address', 'Type'],
					rows: [
						[
							'TechCorp',
							'Alice Brown',
							'contact@techcorp.com',
							'+1122334455',
							'789 Oak St',
							'Software'
						],
						['Foodies Inc.', 'Bob Green', 'info@foodies.com', '+9988776655', '321 Pine St', 'Food']
					]
				};
			case 'deals':
				return {
					columns: ['Deal Name', 'Owner', 'Amount', 'Stage', 'Close Date'],
					rows: [['Big Tech Deal', 'Alice', '$500,000', 'Negotiation', '2024-12-01']]
				};
			case 'invoices':
				return {
					columns: [
						'ID',
						'Title',
						'Bill To',
						'Date Created',
						'Amount Paid',
						'Amount Due',
						'Due Date',
						'Status'
					],
					rows: [
						[
							'001',
							'Fertilizer Subscription',
							'Jensen Fertilizers',
							'2024-11-01',
							'$200',
							'$50',
							'2024-12-01',
							'Unpaid'
						]
					]
				};
			case 'tickets':
				return {
					columns: ['ID', 'Title', 'Crop', 'Status', 'Budget', 'Created On', 'End Date'],
					rows: [
						['001', 'Summer Farm', 'Green Tea', 'Active', '40,000', '2024-11-01', '2025-07-01']
					]
				};
			default:
				return { columns: [], rows: [] };
		}
	});

	const filteredRows: Readable<any[][]> = derived([data, searchQuery], ([$data, $searchQuery]) => {
		if (!$searchQuery) return $data.rows;
		return $data.rows.filter((row) =>
			row.some((cell) => cell.toString().toLowerCase().includes($searchQuery.toLowerCase()))
		);
	});

	const paginatedRows: Readable<any[][]> = derived(
		[filteredRows, currentPage, itemsPerPage],
		([$filteredRows, $currentPage, $itemsPerPage]) => {
			const start = ($currentPage - 1) * $itemsPerPage;
			const end = start + $itemsPerPage;
			return $filteredRows.slice(start, end);
		}
	);

	const totalRecordCount: Readable<number> = derived(
		filteredRows,
		($filteredRows) => $filteredRows.length
	);

	const formTitle = derived(view, ($view) => {
		if ($view === 'contacts') return 'Create Contact';
		if ($view === 'companies') return 'Create Company';
		if ($view === 'tickets') return 'Create Ticket';
		return '';
	});

	function handleFormSubmit(values: Record<string, string>) {
		console.log('Form submitted:', values);
		closeSidebar();
	}

	// Fixes Required
	function handleRowClick(row: any[]) {
		const currentView = $view;
		if (currentView === 'contacts') {
			const id = row[0];
			const title = row[1];
			const crop = row[2];
			const budget = row[4];
			goto(
				`/platform/${userId}/contacts/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}&crop=${encodeURIComponent(crop)}&budget=${encodeURIComponent(budget)}`
			);
		} else if (currentView === 'companies') {
			const id = row[0];
			const title = row[1];
			const crop = row[2];
			const budget = row[4];
			goto(
				`/platform/${userId}/company/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}&crop=${encodeURIComponent(crop)}&budget=${encodeURIComponent(budget)}`
			);
		}
		if (currentView === 'deals') {
			const id = row[0];
			const title = row[1];
			const crop = row[2];
			const budget = row[4];
			goto(
				`/platform/${userId}/deals/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}&crop=${encodeURIComponent(crop)}&budget=${encodeURIComponent(budget)}`
			);
		} else if (currentView === 'invoices') {
			const id = row[0];
			const title = row[1];
			const billTo = row[2];
			const amount = row[4];
			const due = row[5];
			const status = row[6];
			goto(
				`/platform/${userId}/invoice/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}&billTo=${encodeURIComponent(billTo)}&amount=${encodeURIComponent(amount)}&due=${encodeURIComponent(due)}&status=${encodeURIComponent(status)}`
			);
		} else if (currentView === 'tickets') {
			const id = row[0];
			const title = row[1];
			const crop = row[2];
			const budget = row[4];
			goto(
				`/platform/${userId}/ticket/${encodeURIComponent(id)}?title=${encodeURIComponent(title)}&crop=${encodeURIComponent(crop)}&budget=${encodeURIComponent(budget)}`
			);
		}
	}
</script>

<div class="flex justify-between items-center dark:bg-dark relative mb-4">
	<div class="relative">
		<button
			class="flex items-center text-lg font-semibold dark:text-white rounded focus:outline-none"
			onclick={() => (dropdownOpen = !dropdownOpen)}
		>
			{#if $view === 'contacts'}
				Contacts
			{:else if $view === 'companies'}
				Companies
			{:else if $view === 'deals'}
				Deals
			{:else if $view === 'invoices'}
				Invoices
			{:else if $view === 'tickets'}
				Tickets
			{/if}
			<svg
				class="ml-2 w-4 h-4 transform transition-transform"
				style:rotate={dropdownOpen ? '180deg' : '0deg'}
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>

		{#if dropdownOpen}
			<SearchDropdown items={dropdownItems} {navigateTo} />
		{/if}
		<p class="text-xs text-gray-100 dark:text-light">{$totalRecordCount} Record(s)</p>
	</div>

	<div class="flex gap-2">
		<Button
			text={`Create ${$view.charAt(0).toUpperCase() + $view.slice(1)}`}
			style="primary"
			on:click={openSidebar}
		/>
	</div>
</div>

<!-- <div class="flex items-center ml-4 mb-4">
	{#each $writableFilters as filter}
		<div class="border-l border-gray-300 border-r">
			<div class="flex items-center gap-12 border-t border-b border-gray-300 px-3 py-2">
				<button onclick={() => navigateToView(filter.view)}>
					{filter.label}
				</button>
				<button
					class="focus:outline-none"
					onclick={() => writableFilters.update((f) => f.filter((fil) => fil !== filter))}
				>
					&times;
				</button>
			</div>
		</div>
	{/each}
</div> -->

<Table
	data={$data}
	{filteredRows}
	{currentPage}
	{itemsPerPage}
	{paginationItems}
	{searchQuery}
	totalRecordCount={$totalRecordCount}
	onRowClick={handleRowClick}
/>

{#if $isSidebarOpen}
	<FormElement view={$view} onClose={closeSidebar} onSubmit={handleFormSubmit} />
{/if}
