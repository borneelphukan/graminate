<script lang="ts">
	import { page } from '$app/stores';
	import { derived } from 'svelte/store';

	// Extract the view from query parameters
	const view = derived(page, ($page) => $page.url.searchParams.get('view') || 'contacts');

	// Navigate to the specified view
	function navigateToView(view: string) {
		const url = new URL(window.location.href);
		url.searchParams.set('view', view);
		window.location.href = url.toString();
	}

	// Placeholder function for removing filters (e.g., triggered by clicking the cross)
	function removeFilter(view: string) {
		alert(`Filter "${view}" removed`);
	}
</script>

{#if $view === 'contacts'}
	<section class="p-4">
		<div class="flex justify-between items-center mb-4">
			<div class="flex items-center gap-2">
				<!-- All Contacts -->
				<div class="flex items-center gap-1 bg-gray-400 border border-gray-300 px-3 py-2 rounded">
					<button class="btn-secondary" on:click={() => navigateToView('contacts')}>
						All Contacts
					</button>
					<button class=" focus:outline-none" on:click={() => removeFilter('All Contacts')}>
						&times;
					</button>
				</div>

				<!-- Newsletter Subscribers -->
				<div class="flex items-center gap-1 bg-gray-400 border border-gray-300 px-3 py-2 rounded">
					<button class="btn-secondary" on:click={() => navigateToView('newsletter')}>
						Newsletter Subscribers
					</button>
					<button
						class=" focus:outline-none"
						on:click={() => removeFilter('Newsletter Subscribers')}
					>
						&times;
					</button>
				</div>

				<!-- Unsubscribed -->
				<div class="flex items-center gap-1 bg-gray-400 border border-gray-300 px-3 py-2 rounded">
					<button class="btn-secondary" on:click={() => navigateToView('unsubscribed')}>
						Unsubscribed
					</button>
					<button class=" focus:outline-none" on:click={() => removeFilter('Unsubscribed')}>
						&times;
					</button>
				</div>

				<!-- All Customers -->
				<div class="flex items-center gap-1 bg-gray-400 border border-gray-300 px-3 py-2 rounded">
					<button class="btn-secondary" on:click={() => navigateToView('customers')}>
						All Customers
					</button>
					<button class=" focus:outline-none" on:click={() => removeFilter('All Customers')}>
						&times;
					</button>
				</div>
			</div>
		</div>

		<!-- Contacts Table -->
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
	<section class="p-4">
		<div class="flex justify-between items-center mb-4">
			<div class="flex items-center gap-2">
				<!-- All Companies -->
				<div class="flex items-center gap-1 bg-gray-400 border border-gray-300 px-3 py-2 rounded">
					<button class="btn-secondary" on:click={() => navigateToView('companies')}>
						All Companies
					</button>
					<button class=" focus:outline-none" on:click={() => removeFilter('All Companies')}>
						&times;
					</button>
				</div>

				<!-- My Companies -->
				<div class="flex items-center gap-1 bg-gray-400 border border-gray-300 px-3 py-2 rounded">
					<button class="btn-secondary" on:click={() => navigateToView('my-companies')}>
						My Companies
					</button>
					<button class=" focus:outline-none" on:click={() => removeFilter('My Companies')}>
						&times;
					</button>
				</div>
			</div>
		</div>

		<!-- Companies Table -->
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
{:else}
	<div>Not set yet</div>
{/if}
