<script lang="ts">
	import Table from '../../components/tables/Table.svelte';
	import Button from '../../components/ui/Button.svelte';
	import { writable } from 'svelte/store';

	// Document data
	interface Document {
		name: string;
		linksCreated: number;
		views: number;
		owner: string;
		lastUpdated: string;
	}

	const documents: Document[] = [
		{
			name: 'FarmHub.pdf',
			linksCreated: 0,
			views: 1,
			owner: 'Borneel Bikash Phukan',
			lastUpdated: 'Nov 25, 2024'
		}
	];

	// Table data setup
	const columns = ['Name', 'Links Created', 'Views', 'Owner', 'Last Updated'];
	const rows = documents.map((doc) => [
		doc.name,
		doc.linksCreated,
		doc.views,
		doc.owner,
		doc.lastUpdated
	]);

	const data = { columns, rows };

	// Pagination and search stores
	const currentPage = writable(1);
	const itemsPerPage = writable(25); // Default to 25 rows per page
	const searchQuery = writable('');
	const filteredRows = writable(rows);

	// Derived filtered rows based on the search query
	$: {
		filteredRows.set(
			rows.filter((row) =>
				row.some((cell) => String(cell).toLowerCase().includes($searchQuery.toLowerCase()))
			)
		);
	}

	// Dropdown items for pagination
	const paginationItems = ['25 per page', '50 per page', '100 per page'];

	// Total record count for the table
	const totalRecordCount = rows.length;
</script>

<div class="flex items-center justify-between px-4 py-2 border-b">
	<h2 class="text-lg font-medium">Documents</h2>

	<div class="flex justify-between items-center py-1 bg-white relative mb-4">
		<div class="flex gap-2">
			<Button text="New Folder" style="secondary" add />
			<Button text="Upload Document" style="primary" />
		</div>
	</div>
</div>

<Table
	{data}
	{filteredRows}
	{currentPage}
	{itemsPerPage}
	{paginationItems}
	{searchQuery}
	{totalRecordCount}
/>
