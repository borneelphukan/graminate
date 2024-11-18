<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	// Define allowed views as a TypeScript union type
	type View = 'contacts' | 'companies' | 'deals' | 'invoices' | 'tickets';

	// Define the filtersMap type
	const filtersMap: Record<View, { label: string; view: string }[]> = {
		contacts: [
			{ label: 'All Contacts', view: 'contacts' },
			{ label: 'Newsletter Subscribers', view: 'newsletter' },
			{ label: 'Unsubscribed', view: 'unsubscribed' },
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
			{ label: 'All tickets', view: 'all-tickets' },
			{ label: 'My open tickets', view: 'open-tickets' },
			{ label: 'Unassigned tickets', view: 'unassigned-tickets' },
			{ label: 'Finished tickets', view: 'finished-tickets' }
		]
	};

	// Extract the view from query parameters, default to 'contacts'
	const view = derived(page, ($page) => ($page.url.searchParams.get('view') as View) || 'contacts');

	// Get the filters for the current view
	const filters = derived(view, ($view) => filtersMap[$view]);

	// Navigate to the specified view
	function navigateToView(view: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('view', view);
		window.location.href = url.toString();
	}

	// Placeholder function for removing filters (e.g., triggered by clicking the cross)
	function removeFilter(filterLabel: string) {
		alert(`Filter "${filterLabel}" removed`);
	}
</script>

<!-- Pass the filter buttons to the layout slot -->
<slot name="filters">
	<!-- Filter Buttons -->
	<div class="flex items-center ml-4">
		{#each $filters as filter}
			<div class="border-l border-gray-300 border-r">
				<div class="flex items-center gap-12 border-t border-b border-gray-300 px-3 py-2">
					<button on:click={() => navigateToView(filter.view)}>
						{filter.label}
					</button>
					<button class="focus:outline-none" on:click={() => removeFilter(filter.label)}>
						&times;
					</button>
				</div>
			</div>
		{/each}
	</div>
</slot>

<!-- Content based on the view -->
{#if $view === 'contacts'}
	<!-- Contacts Table -->
	<section class="p-4">
		<table class="table-auto w-full border">
			<thead>
				<tr>
					<th class="p-2 border">Name</th>
					<th class="p-2 border">Email</th>
					<th class="p-2 border">Lifecycle Stage</th>
					<th class="p-2 border">Contact Owner</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-2 border">Brian Halligan</td>
					<td class="p-2 border">bh@hubspot.com</td>
					<td class="p-2 border">Lead</td>
					<td class="p-2 border">No owner</td>
				</tr>
				<tr>
					<td class="p-2 border">Maria Johnson</td>
					<td class="p-2 border">emailmaria@hubspot.com</td>
					<td class="p-2 border">Lead</td>
					<td class="p-2 border">No owner</td>
				</tr>
			</tbody>
		</table>
	</section>
{:else if $view === 'companies'}
	<!-- Companies Table -->
	<section class="p-4">
		<table class="table-auto w-full border">
			<thead>
				<tr>
					<th class="p-2 border">Company Name</th>
					<th class="p-2 border">Company Owner</th>
					<th class="p-2 border">Create Date</th>
					<th class="p-2 border">Phone Number</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-2 border">--</td>
					<td class="p-2 border">No owner</td>
					<td class="p-2 border">Yesterday at 5:51 PM</td>
					<td class="p-2 border">--</td>
				</tr>
			</tbody>
		</table>
	</section>
{:else if $view === 'tickets'}
	<!-- Companies Table -->
	<section class="p-4">
		<table class="table-auto w-full border">
			<thead>
				<tr>
					<th class="p-2 border">Company Name</th>
					<th class="p-2 border">Company Owner</th>
					<th class="p-2 border">Create Date</th>
					<th class="p-2 border">Phone Number</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td class="p-2 border">--</td>
					<td class="p-2 border">No owner</td>
					<td class="p-2 border">Yesterday at 5:51 PM</td>
					<td class="p-2 border">--</td>
				</tr>
			</tbody>
		</table>
	</section>
{:else if $view === 'invoices'}
	<!-- Invoices Table -->
	<section class="p-4">
		<p>Invoices content goes here.</p>
	</section>
{:else}
	<div>Not set yet</div>
{/if}
