<script lang="ts">
	import { writable, derived, type Writable, type Readable } from 'svelte/store';
	import SearchBar from '../ui/SearchBar.svelte';
	import Button from '../ui/Button.svelte';
	import Dropdown from '../ui/Dropdown.svelte';

	export let data: { columns: string[]; rows: any[][] };
	export let filteredRows: Readable<any[][]>;
	export let currentPage: Writable<number>;
	export let itemsPerPage: Writable<number>;
	export let paginationItems: string[];
	export let searchQuery: Writable<string>;
	export let totalRecordCount: number;

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
		console.log('Selected rows deleted');
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
		class="flex p-1 bg-gray-400 justify-between items-center border-t border-l border-r border-gray-300"
	>
		<div class="flex gap-2">
			<SearchBar mode="table" placeholder="Search anything" bind:query={$searchQuery} />

			{#if $selectedRowCount > 0}
				<div class="flex items-center ml-4">
					<span class="text-gray-700 text-sm font-medium">
						{$selectedRowCount} selected
					</span>
					<a
						href="/"
						class="ml-2 text-blue-600 text-sm hover:underline cursor-pointer"
						onclick={deleteSelectedRows}
					>
						Delete
					</a>
				</div>
			{/if}
		</div>

		<div class="flex gap-2">
			<Button style="secondary" text="Export Data" />
		</div>
	</div>

	{#if $sortedAndPaginatedRows.length > 0}
		<table class="table-auto w-full border">
			<thead>
				<tr>
					<th class="p-2 border border-gray-300 bg-gray-400 text-left">
						<input
							type="checkbox"
							class="form-checkbox h-4 w-4 text-gray-600"
							bind:checked={selectAll}
							onchange={handleSelectAllChange}
						/>
					</th>
					{#each data.columns as column, index}
						<th
							class="p-2 border border-gray-300 bg-gray-400 cursor-pointer text-left"
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
					<tr>
						<td class="p-2 border border-gray-300">
							<input
								type="checkbox"
								class="form-checkbox h-4 w-4 text-gray-600"
								bind:checked={$selectedRows[rowIndex]}
								onchange={(event) => handleRowCheckboxChange(rowIndex, event)}
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

	<nav class="flex items-center justify-between bg-white px-4 py-3 sm:px-6" aria-label="Pagination">
		<div class="flex mx-auto px-5 items-center">
			<Button
				text="Previous"
				style="ghost"
				arrow="left"
				isDisabled={$currentPage === 1}
				on:click={() => $currentPage > 1 && currentPage.set($currentPage - 1)}
			/>

			<p class="mx-3 text-sm text-gray-500">
				<span class="bg-green-300 p-1 border border-gray-300 text-green-100 rounded-sm"
					>{$currentPage}
				</span>
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
