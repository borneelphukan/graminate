<script lang="ts">
	import { page } from '$app/stores';
	import { writable, derived } from 'svelte/store';
	import Button from '../../components/ui/Button.svelte';
	import SearchDropdown from '../../components/ui/SearchDropdown.svelte';
	import Dropdown from '../../components/ui/Dropdown.svelte';
	import SearchBar from '../../components/ui/SearchBar.svelte';
	import FormElement from '../../components/forms/FormElement.svelte';

	const isSidebarOpen = writable(false);

	function openSidebar() {
		isSidebarOpen.set(true);
	}

	function closeSidebar() {
		isSidebarOpen.set(false);
	}
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

	// Search state
	const searchQuery = writable('');

	// Sorting state
	const sortOrder = writable<'asc' | 'desc'>('asc');
	const sortColumn = writable<number | null>(null);

	// Derived stores for table data
	const data = derived(view, ($view) => {
		switch ($view) {
			case 'contacts':
				return {
					columns: ['First Name', 'Last Name', 'Email', 'Phone Number', 'Type', 'Address'],
					rows: [
						[
							'John',
							'Doe',
							'john.doe@example.com',
							'+123456789',
							'Customer',
							'123 Main St, Cityville'
						],
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
			case 'companies':
				return {
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
			case 'deals':
				return {
					columns: ['Deal Name', 'Owner', 'Amount', 'Stage', 'Close Date'],
					rows: [
						['Big Tech Deal', 'Alice Brown', '$500,000', 'Negotiation', '2024-12-01'],
						['Startup Investment', 'Bob Green', '$250,000', 'Closed Won', '2024-11-15']
					]
				};
			case 'invoices':
				return {
					columns: ['Invoice Number', 'Customer Name', 'Amount', 'Status', 'Due Date'],
					rows: [
						['INV-001', 'John Doe', '$1,000', 'Paid', '2024-11-01'],
						['INV-002', 'Jane Smith', '$500', 'Unpaid', '2024-11-30']
					]
				};
			case 'tickets':
				return {
					columns: ['Ticket ID', 'Subject', 'Status', 'Assigned To', 'Created Date'],
					rows: [
						['TCK-001', 'Login Issue', 'Open', 'Alice Brown', '2024-11-01'],
						['TCK-002', 'Payment Failed', 'Closed', 'Bob Green', '2024-11-02']
					]
				};
			default:
				return { columns: [], rows: [] };
		}
	});

	// Derived store for filtered rows
	const filteredRows = derived(
		[data, searchQuery, sortOrder, sortColumn],
		([$data, $searchQuery, $sortOrder, $sortColumn]) => {
			let rows = $data.rows;

			if ($searchQuery) {
				const lowerCaseQuery = $searchQuery.toLowerCase();
				rows = rows.filter((row) =>
					row.some((cell) => cell.toLowerCase().includes(lowerCaseQuery))
				);
			}

			if ($sortColumn !== null) {
				rows = [...rows].sort((a, b) => {
					const valueA = a[$sortColumn];
					const valueB = b[$sortColumn];

					if ($sortOrder === 'asc') {
						return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
					} else {
						return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
					}
				});
			}

			return rows;
		}
	);

	// Derived store to calculate paginated data
	const paginatedRows = derived(
		[filteredRows, currentPage, itemsPerPage],
		([$filteredRows, $currentPage, $itemsPerPage]) => {
			const start = ($currentPage - 1) * $itemsPerPage;
			const end = start + $itemsPerPage;
			return $filteredRows.slice(start, end);
		},
		[]
	);

	const totalRecordCount = derived(filteredRows, ($filteredRows) => $filteredRows.length);

	function toggleSort(columnIndex: number) {
		if (columnIndex === $sortColumn) {
			sortOrder.set($sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			sortColumn.set(columnIndex);
			sortOrder.set('asc');
		}
	}

	// Dynamic fields for FormElement
	const formFields = derived(view, ($view) => {
		if ($view === 'contacts') {
			return [
				{ id: 'firstName', label: 'First Name', placeholder: 'e.g. John', type: 'text' },
				{ id: 'lastName', label: 'Last Name', placeholder: 'e.g. Doe', type: 'text' },
				{ id: 'email', label: 'Email', placeholder: 'e.g. john.doe@gmail.com', type: 'email' },
				{
					id: 'phoneNumber',
					label: 'Phone Number',
					placeholder: 'e.g. +91 XXXXX XXX XX',
					type: 'tel'
				},
				// Add missing fields with appropriate default values
				{ id: 'type', label: 'Type', placeholder: 'Enter type', type: 'text' }
			];
		} else if ($view === 'companies') {
			return [
				{
					id: 'companyName',
					label: 'Company Name',
					placeholder: 'Enter company name',
					type: 'text'
				},
				{
					id: 'companyOwner',
					label: 'Company Representative',
					placeholder: 'e.g. John Doe',
					type: 'text'
				},
				{ id: 'industry', label: 'Industry', placeholder: 'Enter industry', type: 'text' },
				{ id: 'type', label: 'Type', placeholder: 'Enter type', type: 'text' },
				{ id: 'city', label: 'City', placeholder: 'Enter city', type: 'text' },
				{ id: 'state', label: 'State/Region', placeholder: 'Enter state/region', type: 'text' }
			];
		} else if ($view === 'tickets') {
			return [
				{
					id: 'domainName',
					label: 'Company Domain Name',
					placeholder: 'Enter domain',
					type: 'text'
				},
				{
					id: 'companyName',
					label: 'Ticket Name',
					placeholder: 'Enter company name',
					type: 'text'
				},
				{ id: 'companyOwner', label: 'Company Owner', placeholder: 'Enter owner', type: 'text' },
				{ id: 'industry', label: 'Industry', placeholder: 'Enter industry', type: 'text' },
				{ id: 'type', label: 'Type', placeholder: 'Enter type', type: 'text' },
				{ id: 'city', label: 'City', placeholder: 'Enter city', type: 'text' },
				{ id: 'state', label: 'State/Region', placeholder: 'Enter state/region', type: 'text' }
			];
		}
		return [];
	});

	const formTitle = derived(view, ($view) => {
		if ($view === 'contacts') return 'Create Contact';
		if ($view === 'companies') return 'Create Company';
		if ($view === 'tickets') return 'Create Ticket';
		return '';
	});

	// Header checkbox state
	let selectAll: boolean = false;

	// Row checkboxes state as a writable store
	const selectedRows = writable<boolean[]>([]);

	// Reactive update: Initialize `selectedRows` based on the number of paginated rows
	$: if ($paginatedRows) {
		selectedRows.set(Array($paginatedRows.length).fill(selectAll));
	}

	// Derived store to calculate the count of selected rows
	const selectedRowCount = derived(
		selectedRows,
		($selectedRows) => $selectedRows.filter((isSelected: boolean) => isSelected).length
	);

	// Update the `selectAll` state based on individual checkboxes
	function updateSelectAll() {
		selectedRows.update(($selectedRows) => {
			selectAll = $selectedRows.every((checked) => checked);
			return $selectedRows;
		});
	}
	function handleSelectAllChange() {
		selectedRows.update(() => Array($paginatedRows.length).fill(selectAll));
	}

	function handleRowCheckboxChange(rowIndex: number, event: Event) {
		const target = event.target as HTMLInputElement;
		if (target) {
			const isChecked = target.checked;
			selectedRows.update(($selectedRows) => {
				$selectedRows[rowIndex] = isChecked;
				selectAll = $selectedRows.every((checked) => checked);
				return $selectedRows;
			});
		}
	}

	function deleteSelectedRows() {
		// To be implemented
	}
</script>

<!-- Top Section with Dropdown and Action Buttons -->
<div class="flex justify-between items-center py-1 bg-white relative mb-4">
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
		<p class="text-xs text-gray-100">{$totalRecordCount} Record(s)</p>
	</div>

	<div class="flex gap-2">
		<Button text="Actions" style="secondary" arrow="down" />
		<Button text="Import" style="secondary" />
		<Button
			text={`Create ${$view.charAt(0).toUpperCase() + $view.slice(1, -1)}`}
			style="primary"
			on:click={openSidebar}
		/>
	</div>
</div>

<!-- <div class="flex items-center ml-4 mb-4">
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
</div> -->

<!-- Data Table -->
<div>
	<div
		class="flex p-1 bg-gray-400 justify-between items-center border-t border-l border-r border-gray-300"
	>
		<div class="flex gap-2">
			<!-- SearchBar -->
			<SearchBar mode="table" placeholder="Search anything" bind:query={$searchQuery} />

			<!-- Selected Row Count -->
			{#if $selectedRowCount > 0}
				<div class="flex items-center ml-4">
					<span class="text-gray-700 text-sm font-medium">
						{$selectedRowCount} selected
					</span>
					<a
						href="/"
						class="ml-2 text-blue-600 text-sm hover:underline cursor-pointer"
						on:click={deleteSelectedRows}
					>
						Delete
					</a>
				</div>
			{/if}
		</div>

		<!-- Action Buttons -->
		<div class="flex gap-2">
			<Button style="secondary" text="Export" />
			<Button style="secondary" text="Edit Column" />
		</div>
	</div>

	{#if $filteredRows.length > 0}
		<table class="table-auto w-full border">
			<thead>
				<tr>
					<!-- Header Checkbox -->
					<th class="p-2 border border-gray-300 bg-gray-400 text-left">
						<input
							type="checkbox"
							class="form-checkbox h-4 w-4 text-gray-600"
							bind:checked={selectAll}
							on:change={handleSelectAllChange}
						/>
					</th>
					{#each $data.columns as column, index}
						<th
							class="p-2 border border-gray-300 bg-gray-400 cursor-pointer text-left"
							on:click={() => toggleSort(index)}
						>
							<div class="flex items-center justify-between">
								<span class="mr-2 font-semibold">{column}</span>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="size-6"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
									/>
								</svg>
							</div>
						</th>
					{/each}
				</tr>
			</thead>

			<tbody>
				{#each $paginatedRows as row, rowIndex}
					<tr>
						<!-- Row Checkbox -->
						<td class="p-2 border border-gray-300">
							<input
								type="checkbox"
								class="form-checkbox h-4 w-4 text-gray-600"
								bind:checked={$selectedRows[rowIndex]}
								on:change={(event) => handleRowCheckboxChange(rowIndex, event)}
							/>
						</td>
						{#each row as cell}
							<td class="p-2 border border-gray-300 text-base font-light">{cell}</td>
						{/each}
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div class="text-center p-4 text-gray-300">
			<span class="text-lg">⚠️</span> Record(s) not Found
		</div>
	{/if}
</div>

<!-- Pagination -->
<nav class="flex items-center justify-between bg-white px-4 py-3 sm:px-6" aria-label="Pagination">
	<div class="flex mx-auto px-5 items-center">
		<!-- Previous Button -->
		<Button
			text="Previous"
			style="ghost"
			arrow="left"
			isDisabled={$currentPage === 1}
			on:click={() => $currentPage > 1 && currentPage.set($currentPage - 1)}
		/>

		<!-- Pagination Number -->
		<p class="mx-3 text-sm text-gray-500">
			<span class="bg-green-300 p-1 border border-gray-300 text-green-100 rounded-sm"
				>{$currentPage}
			</span>
		</p>

		<!-- Next Button -->
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

<!-- Render FormElement -->
{#if $isSidebarOpen && ($view === 'contacts' || $view === 'companies' || $view === 'tickets')}
	<FormElement fields={$formFields} title={$formTitle} view={$view} on:close={closeSidebar} />
{/if}
