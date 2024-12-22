<script lang="ts">
	import { writable } from 'svelte/store';

	type Task = {
		id: string;
		title: string;
		type: string;
	};

	type Column = {
		title: string;
		tasks: Task[];
	};

	const columns: Column[] = [
		{
			title: 'TO DO',
			tasks: [{ id: 'FAR-1', title: 'Make Ticket section similar to Jira interface', type: 'feat' }]
		},
		{
			title: 'IN PROGRESS',
			tasks: [{ id: 'FAR-2', title: 'Complete CRM entry forms', type: '' }]
		},
		{
			title: 'DONE',
			tasks: [{ id: 'FAR-3', title: 'Make landing page for FarmHub', type: '' }]
		}
	];

	const addingTask = writable<number | null>(null);
	const editingColumn = writable<number | null>(null);
	const dropdownOpen = writable<{ colIndex: number; taskIndex: number } | null>(null);
	let newTaskTitle = '';
	let newTaskType = '';
	let totalTaskCount = 3;

	function startAddingTask(index: number) {
		newTaskTitle = '';
		newTaskType = '';
		addingTask.set(index);
	}

	function addTask(index: number) {
		if (!newTaskTitle.trim()) {
			alert('Task title is required');
			return;
		}

		const id = `FAR-${++totalTaskCount}`;
		const newTask: Task = {
			id,
			title: newTaskTitle.trim(),
			type: newTaskType.trim() || ''
		};

		columns[index].tasks = [...columns[index].tasks, newTask];
		addingTask.set(null);
	}

	function deleteTask(colIndex: number, taskIndex: number) {
		columns[colIndex].tasks = columns[colIndex].tasks.filter((_, i) => i !== taskIndex);
		dropdownOpen.set(null);
	}

	function toggleDropdown(colIndex: number, taskIndex: number) {
		dropdownOpen.update((current) =>
			current && current.colIndex === colIndex && current.taskIndex === taskIndex
				? null
				: { colIndex, taskIndex }
		);
	}

	function startEditingColumn(index: number) {
		editingColumn.set(index);
	}

	function saveColumnTitle(index: number, newTitle: string) {
		if (newTitle.trim()) {
			columns[index].title = newTitle.trim();
		}
		editingColumn.set(null);
	}
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
	on:click={() => {
		addingTask.set(null);
		dropdownOpen.set(null);
		editingColumn.set(null);
	}}
	class="min-h-screen"
>
	<div class="max-w-6xl mx-auto">
		<h2 class="text-sm">Project / Project_Name</h2>
		<h1 class="text-lg font-bold mt-2 mb-6">KANBAN board</h1>
		<div class="grid grid-cols-1 md:grid-cols-4 gap-6">
			{#each columns as column, colIndex}
				<div class="bg-white shadow rounded-lg p-4 relative" on:click|stopPropagation>
					{#if $editingColumn === colIndex}
						<input
							type="text"
							class="text-sm text-gray-900 mb-4 border-b-2 border-gray-300 w-full focus:outline-none"
							bind:value={column.title}
							on:blur={() => saveColumnTitle(colIndex, column.title)}
						/>
					{:else}
						<button
							type="button"
							class="text-sm text-gray-200 mb-4 cursor-pointer focus:outline-none"
							on:click={() => startEditingColumn(colIndex)}
						>
							{column.title}
						</button>
					{/if}
					<div class="space-y-4">
						{#each column.tasks as task, taskIndex}
							<div class="bg-gray-500 p-3 rounded-md shadow-sm relative">
								<div class="flex flex-row items-start justify-between">
									<div class="mr-2 break-words max-w-xs">
										<p class="text-gray-200">{task.title}</p>
									</div>
									<div class="relative">
										<button
											aria-label="ellipsis"
											on:click={() => toggleDropdown(colIndex, taskIndex)}
										>
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="size-4"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
												/>
											</svg>
										</button>
										{#if $dropdownOpen && $dropdownOpen.colIndex === colIndex && $dropdownOpen.taskIndex === taskIndex}
											<div
												class="absolute right-0 bg-white shadow rounded text-sm text-gray-800 z-10"
												on:click|stopPropagation
											>
												<button
													class="hover:bg-gray-500 px-4 py-1 rounded w-full text-left"
													on:click={() => deleteTask(colIndex, taskIndex)}
												>
													Delete
												</button>
											</div>
										{/if}
									</div>
								</div>
								<div class="flex justify-between items-end mt-2">
									{#if task.type}
										<span class="text-xs font-semibold text-white bg-blue-600 rounded px-2 py-1">
											{task.type}
										</span>
									{/if}
									<span class="text-xs text-gray-300 ml-auto">{task.id}</span>
								</div>
							</div>
						{/each}
					</div>
					{#if $addingTask === colIndex}
						<div class="mt-4 bg-gray-500 p-4 rounded-lg shadow-sm">
							<textarea
								class="w-full p-2 rounded-lg text-sm resize-none"
								placeholder="Task title"
								bind:value={newTaskTitle}
							></textarea>
							<div
								class="mt-2 flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0"
							>
								<input
									type="text"
									class="p-2 rounded-lg text-sm w-full md:flex-1 md:mr-2"
									placeholder="Task Type"
									bind:value={newTaskType}
								/>
								<button
									class="w-full md:w-auto bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
									on:click={() => addTask(colIndex)}
								>
									Create
								</button>
							</div>
						</div>
					{:else}
						<button
							class="mt-4 w-full bg-gray-500 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-400 focus:outline-none"
							on:click={() => startAddingTask(colIndex)}
						>
							+ Create issue
						</button>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</div>
