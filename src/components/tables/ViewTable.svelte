<script lang="ts">
	export let columns: Array<{
		id: string;
		title: string;
		tasks: Array<{ id: string; title: string; type: string }>;
	}>;
	export let filterTasks: (column: {
		id: string;
		title: string;
		tasks: Array<{ id: string; title: string; type: string }>;
	}) => Array<{ id: string; title: string; type: string }>;
	export let searchQuery: string;

	export let headers: Array<{ label: string; key?: string }>;

	let selectedRows = new Set<string>();
	let isAllSelected = false;

	// Reactive variable to check if there's data matching the current filters
	$: hasData = columns.some((column) => filterTasks(column).length > 0);

	function highlightText(text: string, query: string): string {
		if (!query) return text;
		const regex = new RegExp(`(${query})`, 'gi');
		return text.replace(regex, '<mark class="bg-green-300">$1</mark>');
	}

	function toggleRowSelection(taskId: string, isSelected: boolean) {
		const updatedRows = new Set(selectedRows);
		if (isSelected) {
			updatedRows.add(taskId);
		} else {
			updatedRows.delete(taskId);
		}
		selectedRows = updatedRows;
		isAllSelected = areAllRowsSelected();
	}

	function toggleSelectAll(event: Event) {
		const checkbox = event.target as HTMLInputElement;
		const updatedRows = new Set<string>();
		if (checkbox.checked) {
			columns.forEach((column) => filterTasks(column).forEach((task) => updatedRows.add(task.id)));
		} else {
			selectedRows.clear();
		}
		selectedRows = updatedRows;
		isAllSelected = checkbox.checked;
	}

	function areAllRowsSelected() {
		const allTaskIds = columns.flatMap((column) => filterTasks(column)).map((task) => task.id);
		return allTaskIds.every((id) => selectedRows.has(id));
	}
</script>

<table class="table-auto w-full bg-gray-50 dark:bg-slate-800 rounded-lg">
	<thead>
		<tr>
			<th
				class="p-2 border border-gray-300 dark:border-gray-200 bg-gray-400 dark:bg-gray-800 text-left"
			>
				<input
					type="checkbox"
					class="form-checkbox h-4 w-4"
					checked={isAllSelected}
					on:change={toggleSelectAll}
				/>
			</th>
			{#each headers as header}
				<th
					class="p-2 border border-gray-300 dark:border-gray-200 bg-gray-400 dark:bg-gray-800 dark:text-gray-500 cursor-pointer text-left"
				>
					{header.label}
				</th>
			{/each}
		</tr>
	</thead>
	<tbody>
		{#if hasData}
			{#each columns as column}
				{#each filterTasks(column) as task}
					<tr class="cursor-pointer hover:bg-gray-500 dark:hover:bg-gray-700">
						<td class="p-2 border border-gray-300 dark:border-gray-200">
							<input
								type="checkbox"
								class="form-checkbox h-4 w-4"
								checked={selectedRows.has(task.id)}
								on:change={(e) =>
									toggleRowSelection(task.id, (e.target as HTMLInputElement).checked)}
							/>
						</td>
						<td
							class="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
							>{task.id}</td
						>
						<td
							class="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
						>
							{@html highlightText(task.title, searchQuery)}
						</td>
						<td
							class="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
							>{column.title}</td
						>
						<td
							class="p-2 border border-gray-300 dark:border-gray-200 text-base font-light dark:text-gray-400"
						>
							{#each task.type ? task.type.split(', ') : [] as label}
								<span
									class={`inline-block text-xs font-semibold text-white rounded px-2 py-1 ${
										{
											Finance: 'bg-green-100 ',
											Research: 'bg-blue-200',
											Maintenance: 'bg-yellow-200',
											Urgent: 'bg-red-200'
										}[label] || 'bg-gray-300'
									}`}
								>
									{label}
								</span>
							{/each}
						</td>
					</tr>
				{/each}
			{/each}
		{:else}
			<tr>
				<td
					colspan={headers.length + 1}
					class="text-center p-2 text-gray-300 border border-gray-300 dark:border-gray-200"
				>
					<span class="text-lg">⚠️</span> No Tasks Available
				</td>
			</tr>
		{/if}
	</tbody>
</table>
