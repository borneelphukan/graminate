<script lang="ts">
	import { writable } from 'svelte/store';
	import Table from '../../../components/tables/Table.svelte';
	import Button from '../../../components/ui/Button.svelte';

	interface Document {
		name: string;
		type: string;
		views: number;
		owner: string;
		lastUpdated: string;
	}

	const documents: Document[] = [
		{
			name: 'FarmHub.pdf',
			type: 'Properietary',
			views: 1,
			owner: 'Borneel Bikash Phukan',
			lastUpdated: 'Nov 25, 2024'
		}
	];

	const columns = ['Name', 'Type', 'Views', 'Owner', 'Last Updated'];
	const rows = documents.map((doc) => [
		doc.name,
		doc.type,
		doc.views,
		doc.owner,
		doc.lastUpdated
	]);

	const data = { columns, rows };

	const currentPage = writable(1);
	const itemsPerPage = writable(25);
	const searchQuery = writable('');
	const filteredRows = writable(rows);

	$: {
		filteredRows.set(
			rows.filter((row) =>
				row.some((cell) => String(cell).toLowerCase().includes($searchQuery.toLowerCase()))
			)
		);
	}

	const paginationItems = ['25 per page', '50 per page', '100 per page'];
	const totalRecordCount = rows.length;
</script>

<div class="container mx-auto p-4">
	<div class="flex items-center justify-between border-b mb-4">
		<h2 class="text-lg font-bold dark:text-light">Document</h2>

		<div class="flex justify-between items-center relative mb-4">
			<div class="flex gap-2">
				<Button text="Upload Document" style="primary" add />
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
</div>
