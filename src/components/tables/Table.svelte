<script lang="ts">
	import Swal from 'sweetalert2';
	import { writable, derived, type Writable, type Readable } from 'svelte/store';
	import SearchBar from '@ui/SearchBar.svelte';
	import Button from '@ui/Button.svelte';
	import Dropdown from '@ui/Dropdown/DropdownLarge.svelte';

	export let onRowClick: (row: any[]) => void;

	export let data: { columns: string[]; rows: any[][] };
	export let filteredRows: Readable<any[][]>;
	export let currentPage: Writable<number>;
	export let itemsPerPage: Writable<number>;
	export let paginationItems: string[];
	export let searchQuery: Writable<string>;
	export let totalRecordCount: number;
	export let view: string = '';
	export let exportEnabled: boolean = true; // New parameter

	const sortOrder = writable<'asc' | 'desc'>('asc');
	const sortColumn = writable<number | null>(null);

	let selectAll: boolean = false;

	const selectedRows = writable<boolean[]>([]);

	const paginatedRows: Readable<any[][]> = derived(
		[filteredRows, currentPage, itemsPerPage],
		([$filteredRows, $currentPage, $itemsPerPage]) => {
			const start = ($currentPage - 1) * $itemsPerPage;
			const end = start + $itemsPerPage;
			return $filteredRows.slice(start, end);
		},
		[]
	);

	$: if ($paginatedRows.length > 0) {
		selectedRows.set(Array($paginatedRows.length).fill(selectAll));
	}

	const selectedRowCount = derived(
		selectedRows,
		($selectedRows) => $selectedRows.filter((isSelected) => isSelected).length
	);

	function exportTableData() {
		if ($sortedAndPaginatedRows.length === 0) {
			Swal.fire('No Data', 'There is no data to export.', 'info');
			return;
		}

		const csvContent = [
			data.columns.join(','), // Header row
			...$sortedAndPaginatedRows.map((row) => row.join(',')) // Data rows
		].join('\n');

		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${view}.csv`; // Filename is the view name
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
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

	async function deleteSelectedRows() {
		const rowsToDelete: number[] = [];

		selectedRows.subscribe(($selectedRows) => {
			$selectedRows.forEach((isSelected, index) => {
				if (isSelected) {
					const id = $paginatedRows[index][0];
					rowsToDelete.push(id);
				}
			});
		})();

		if (rowsToDelete.length === 0) {
			Swal.fire('No Selection', 'Please select at least one row to delete.', 'info');
			return;
		}

		const result = await Swal.fire({
			title: 'Are you sure?',
			text: `Do you want to delete the selected ${view === 'companies' ? 'companies' : 'contacts'}? This action cannot be undone.`,
			icon: 'warning',
			showCancelButton: true,
			confirmButtonText: 'Yes, delete them!',
			cancelButtonText: 'Cancel',
			reverseButtons: true
		});

		if (result.isConfirmed) {
			try {
				const endpoint = view === 'companies' ? 'companies' : 'contacts';

				await Promise.all(
					rowsToDelete.map(async (id) => {
						const response = await fetch(`http://localhost:3000/api/${endpoint}/delete/${id}`, {
							method: 'DELETE'
						});

						if (!response.ok) {
							throw new Error(`Failed to delete ${endpoint.slice(0, -1)} with id ${id}`);
						}
					})
				);

				location.reload();
			} catch (error) {
				console.error('Error deleting rows:', error);
				Swal.fire('Error', 'Failed to delete selected rows. Please try again.', 'error');
			}
		}
	}

	function toggleSort(columnIndex: number) {
		if (columnIndex === $sortColumn) {
			sortOrder.set($sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			sortColumn.set(columnIndex);
			sortOrder.set('asc');
		}

		currentPage.set(1);
	}

	function handleSelect(event: CustomEvent<{ item: string }>) {
		const selected = event.detail.item;

		if (selected === '25 per page') itemsPerPage.set(25);
		else if (selected === '50 per page') itemsPerPage.set(50);
		else if (selected === '100 per page') itemsPerPage.set(100);
	}

	const sortedAndPaginatedRows: Readable<any[][]> = derived(
		[paginatedRows, sortColumn, sortOrder],
		([$paginatedRows, $sortColumn, $sortOrder]) => {
			let rows = [...$paginatedRows];

			if ($sortColumn !== null) {
				rows.sort((a, b) => {
					const valueA = a[$sortColumn];
					const valueB = b[$sortColumn];

					if (typeof valueA === 'string' && typeof valueB === 'string') {
						return $sortOrder === 'asc'
							? valueA.localeCompare(valueB)
							: valueB.localeCompare(valueA);
					}
					if (typeof valueA === 'number' && typeof valueB === 'number') {
						return $sortOrder === 'asc' ? valueA - valueB : valueB - valueA;
					}
					return 0;
				});
			}

			return rows;
		},
		[]
	);
</script>

<div>
	<div
		class="flex p-1 justify-between items-center border-t border-l border-r border-gray-300 dark:border-gray-200"
	>
		<div class="flex gap-2">
			<SearchBar mode="table" placeholder="Search anything" bind:query={$searchQuery} />

			{#if $selectedRowCount > 0}
				<div class="flex items-center ml-4">
					<span class="text-gray-200 dark:text-gray-400 text-sm font-medium">
						{$selectedRowCount} selected
					</span>
					<button
						class="ml-2 text-blue-200 text-sm hover:underline cursor-pointer"
						onclick={(event) => {
							event.preventDefault();
							deleteSelectedRows();
						}}
					>
						Delete
					</button>
				</div>
			{/if}
		</div>

		<div class="flex gap-2">
			{#if exportEnabled}
				<Button style="secondary" text="Export Data" on:click={exportTableData} />
			{/if}
		</div>
	</div>

	{#if $sortedAndPaginatedRows.length > 0}
		<table class="table-auto w-full border">
			<thead>
				<tr>
					<th
						class="p-2 border border-gray-300 dark:border-gray-200 bg-gray-400 dark:bg-gray-800 text-left"
					>
						<input
							type="checkbox"
							class="form-checkbox h-4 w-4 text-gray-600"
							bind:checked={selectAll}
							onchange={handleSelectAllChange}
						/>
					</th>
					{#each data.columns as column, index}
						<th
							class="p-2 border border-gray-300 dark:border-gray-200 bg-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-pointer text-left"
							onclick={() => toggleSort(index)}
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
				{#each $sortedAndPaginatedRows as row, rowIndex}
					<tr
						class="cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-700"
						onclick={(event) => {
							if (!(event.target instanceof HTMLInputElement)) {
								onRowClick(row);
							}
						}}
					>
						<td class="p-2 border border-gray-300 dark:border-gray-200">
							<input
								type="checkbox"
								class="form-checkbox h-4 w-4 text-gray-200 dark:text-light"
								bind:checked={$selectedRows[rowIndex]}
								onchange={(event) => handleRowCheckboxChange(rowIndex, event)}
							/>
						</td>
						<!-- For deleting data from the table, there is a hidden column of ID. ID is required for removing data -->
						{#if view === 'contacts' || view === 'companies' || view === 'deals'}
							{#each row.slice(1) as cell}
								<td
									class="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
								>
									{cell}
								</td>
							{/each}
						{:else}
							{#each row as cell}
								<td
									class="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
								>
									{cell}
								</td>
							{/each}
						{/if}
					</tr>
				{/each}
			</tbody>
		</table>
	{:else}
		<div class="text-center p-4 text-gray-300">
			<span class="text-lg">⚠️</span> Record(s) not Found
		</div>
	{/if}

	<nav class="flex items-center justify-between px-4 py-3 sm:px-6" aria-label="Pagination">
		<div class="flex mx-auto px-5 items-center">
			<Button
				text="Previous"
				style="ghost"
				arrow="left"
				isDisabled={$currentPage === 1}
				on:click={() => $currentPage > 1 && currentPage.set($currentPage - 1)}
			/>

			<p class="mx-3 text-sm dark:text-light text-dark">
				<span class=" px-2 py-1 border border-gray-300 rounded-sm">{$currentPage} </span>
			</p>

			<Button
				text="Next"
				style="ghost"
				arrow="right"
				isDisabled={$currentPage === Math.ceil(totalRecordCount / $itemsPerPage)}
				on:click={() =>
					$currentPage < Math.ceil(totalRecordCount / $itemsPerPage) &&
					currentPage.set($currentPage + 1)}
			/>
		</div>
		<div class="relative">
			<Dropdown items={paginationItems} selectedItem="25 per page" on:select={handleSelect} />
		</div>
	</nav>
</div>
