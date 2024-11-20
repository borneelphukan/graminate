<script lang="ts">
	import { page } from '$app/stores';
	import { writable, derived } from 'svelte/store';
	import Button from '../../components/ui/Button.svelte';
	import SearchDropdown from '../../components/ui/SearchDropDown.svelte';
	import Dropdown from '../../components/ui/Dropdown.svelte';

	type View = 'contacts' | 'companies' | 'deals' | 'invoices' | 'tickets';

	// Filters and data definitions
	const filtersMap: Record<View, { label: string; view: string }[]> = {
		contacts: [
			{ label: 'All Contacts', view: 'contacts' },
			{ label: 'Private Contacts', view: 'private' },
			{ label: 'Business Contacts', view: 'business' },
			{ label: 'All Customers', view: 'customers' }
		],
		companies: [
			{ label: 'All Companies', view: 'companies' },
			{ label: 'Active Companies', view: 'active-companies' },
			{ label: 'Inactive Companies', view: 'inactive-companies' }
		],
		deals: [
			{ label: 'All Deals', view: 'deals' },
			{ label: 'Open Deals', view: 'open-deals' },
			{ label: 'Closed Deals', view: 'closed-deals' }
		],
		invoices: [
			{ label: 'All Invoices', view: 'invoices' },
			{ label: 'Paid Invoices', view: 'paid-invoices' },
			{ label: 'Unpaid Invoices', view: 'unpaid-invoices' }
		],
		tickets: [
			{ label: 'All Tickets', view: 'tickets' },
			{ label: 'My Open Tickets', view: 'open-tickets' },
			{ label: 'Unassigned Tickets', view: 'unassigned-tickets' },
			{ label: 'Finished Tickets', view: 'finished-tickets' }
		]
	};

	const view = derived(page, ($page) => ($page.url.searchParams.get('view') as View) || 'contacts');
	const writableFilters = writable(filtersMap['contacts']);
	view.subscribe(($view) => writableFilters.set([...filtersMap[$view]]));

	// Dropdown open state
	let dropdownOpen = false;

	// Pagination state
	const currentPage = writable(1);
	const itemsPerPage = writable(25);
	const paginationItems = ['25 per page', '50 per page', '100 per page'];

	function handleSelect(event: CustomEvent<{ item: string }>) {
		const selected = event.detail.item;

		// Update itemsPerPage based on the selected item
		if (selected === '25 per page') itemsPerPage.set(25);
		else if (selected === '50 per page') itemsPerPage.set(50);
		else if (selected === '100 per page') itemsPerPage.set(100);
	}

	// Function to navigate to a specific view
	function navigateToView(view: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('view', view);
		window.location.href = url.toString();
		dropdownOpen = false;
	}

	// Define navigateTo function
	function navigateTo(view: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('view', view);
		window.location.href = url.toString();
		dropdownOpen = false;
	}

	// Items for the search dropdown
	const dropdownItems = [
		{ label: 'Contacts', view: 'contacts' },
		{ label: 'Companies', view: 'companies' },
		{ label: 'Deals', view: 'deals' },
		{ label: 'Invoices', view: 'invoices' },
		{ label: 'Tickets', view: 'tickets' }
	];

	// Table data for each view
	const contactsData = {
		columns: ['First Name', 'Last Name', 'Email', 'Phone Number', 'Type', 'Address'],
		rows: [
			['John', 'Doe', 'john.doe@example.com', '+123456789', 'Customer', '123 Main St, Cityville'],
			[
				'Jane',
				'Smith',
				'jane.smith@example.com',
				'+987654321',
				'Subscriber',
				'456 Elm St, Townsville'
			]
		]
	};

	const companiesData = {
		columns: [
			'Company Name',
			'Owner Name',
			'Email',
			'Phone Number',
			'Company Address',
			'Item Type'
		],
		rows: [
			[
				'TechCorp',
				'Alice Brown',
				'contact@techcorp.com',
				'+1122334455',
				'789 Oak St, Metropolis',
				'Software'
			],
			[
				'Foodies Inc.',
				'Bob Green',
				'info@foodies.com',
				'+9988776655',
				'321 Pine St, Foodtown',
				'Food Services'
			]
		]
	};

	const dealsData = {
		columns: ['Deal Name', 'Owner', 'Amount', 'Stage', 'Close Date'],
		rows: [
			['Big Tech Deal', 'Alice Brown', '$500,000', 'Negotiation', '2024-12-01'],
			['Startup Investment', 'Bob Green', '$250,000', 'Closed Won', '2024-11-15']
		]
	};

	const invoicesData = {
		columns: ['Invoice Number', 'Customer Name', 'Amount', 'Status', 'Due Date'],
		rows: [
			['INV-001', 'John Doe', '$1,000', 'Paid', '2024-11-01'],
			['INV-002', 'Jane Smith', '$500', 'Unpaid', '2024-11-30']
		]
	};

	const ticketsData = {
		columns: ['Ticket ID', 'Subject', 'Status', 'Assigned To', 'Created Date'],
		rows: [
			['TCK-001', 'Login Issue', 'Open', 'Alice Brown', '2024-11-01'],
			['TCK-002', 'Payment Failed', 'Closed', 'Bob Green', '2024-11-02']
		]
	};

	// Derived store for table data based on view
	const data = derived(view, ($view) => {
		switch ($view) {
			case 'contacts':
				return contactsData;
			case 'companies':
				return companiesData;
			case 'deals':
				return dealsData;
			case 'invoices':
				return invoicesData;
			case 'tickets':
				return ticketsData;
			default:
				return { columns: [], rows: [] };
		}
	});

	// Derived store to calculate paginated data
	const paginatedRows = derived(
		[data, currentPage, itemsPerPage],
		([$data, $currentPage, $itemsPerPage]) => {
			const start = ($currentPage - 1) * $itemsPerPage;
			const end = start + $itemsPerPage;
			return $data.rows.slice(start, end);
		},
		[] as string[][] // Initial value and type
	);

	// Derived store to calculate the total record count
	const totalRecordCount = derived(data, ($data) => $data.rows.length);

	const recordCount = derived(data, ($data) => $data.rows.length);
</script>

<!-- Top Section with Dropdown and Action Buttons -->
<div class="flex justify-between items-center px-4 py-1 bg-white relative mb-4">
	<div class="relative">
		<button
			class="flex items-center text-lg font-semibold bg-white rounded focus:outline-none"
			on:click={() => (dropdownOpen = !dropdownOpen)}
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
		<p class="text-xs text-gray-100">{$recordCount} Record(s)</p>
	</div>

	<div class="flex gap-2">
		<Button text="Actions" style="secondary" arrow="down" />
		<Button text="Import" style="secondary" />
		<Button text={`Create ${$view.charAt(0).toUpperCase() + $view.slice(1, -1)}`} style="primary" />
	</div>
</div>

<!-- Filters Section -->
<div class="flex items-center ml-4 mb-4">
	{#each $writableFilters as filter}
		<div class="border-l border-gray-300 border-r">
			<div class="flex items-center gap-12 border-t border-b border-gray-300 px-3 py-2">
				<button on:click={() => navigateToView(filter.view)}>
					{filter.label}
				</button>
				<button
					class="focus:outline-none"
					on:click={() => writableFilters.update((f) => f.filter((fil) => fil !== filter))}
				>
					&times;
				</button>
			</div>
		</div>
	{/each}
</div>

<!-- Data Table -->
<table class="table-auto w-full border">
	<thead>
		<tr>
			{#each $data.columns as column}
				<th class="p-2 border">{column}</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#each $paginatedRows as row}
			<tr>
				{#each row as cell}
					<td class="p-2 border">{cell}</td>
				{/each}
			</tr>
		{/each}
	</tbody>
</table>

<!-- Pagination -->
<nav class="flex items-center justify-between bg-white px-4 py-3 sm:px-6" aria-label="Pagination">
	<div class="flex mx-auto px-5">
		<Button
			text="Previous"
			style="ghost"
			arrow="left"
			isDisabled={$currentPage === 1}
			on:click={() => $currentPage > 1 && currentPage.set($currentPage - 1)}
		/>

		<Button
			text="Next"
			style="ghost"
			arrow="right"
			isDisabled={$currentPage === Math.ceil($totalRecordCount / $itemsPerPage)}
			on:click={() =>
				$currentPage < Math.ceil($totalRecordCount / $itemsPerPage) &&
				currentPage.set($currentPage + 1)}
		/>
	</div>
	<div class="relative">
		<Dropdown items={paginationItems} selectedItem="25 per page" on:select={handleSelect} />
	</div>
</nav>
