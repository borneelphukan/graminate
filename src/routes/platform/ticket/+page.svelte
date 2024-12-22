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
	const dropdownOpen = writable<{ colIndex: number; taskIndex: number } | null>(null); // Keep track of which dropdown is open
	let newTaskTitle = '';
	let newTaskType = '';
	let totalTaskCount = 3; // To ensure global task numbering across all columns

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

		// Add the new task to the column
		columns[index].tasks = [...columns[index].tasks, newTask];

		// Close the input box
		addingTask.set(null);
	}

	function deleteTask(colIndex: number, taskIndex: number) {
		columns[colIndex].tasks = columns[colIndex].tasks.filter((_, i) => i !== taskIndex);
		dropdownOpen.set(null); // Close dropdown
	}

	function toggleDropdown(colIndex: number, taskIndex: number) {
		dropdownOpen.update((current) =>
			current && current.colIndex === colIndex && current.taskIndex === taskIndex
				? null
				: { colIndex, taskIndex }
		);
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
	on:click={() => {
		addingTask.set(null);
		dropdownOpen.set(null);
	}}
	class="min-h-screen"
>
	<div class="max-w-6xl mx-auto">
		<h2 class="text-sm">Project / Project_Name</h2>
		<h1 class="text-lg font-bold mt-2 mb-6">KANBAN board</h1>
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			{#each columns as column, colIndex}
				<div class="bg-white shadow rounded-lg p-4 relative" on:click|stopPropagation>
					<h3 class="text-lg font-semibold text-gray-200 mb-2">{column.title}</h3>
					<div class="space-y-4">
						{#each column.tasks as task, taskIndex}
							<div class="bg-gray-500 p-3 rounded-md shadow-sm relative">
								<div class="flex items-start justify-between">
									<div>
										<p class="text-gray-200">{task.title}</p>
									</div>
									<div class="relative">
										<!-- svelte-ignore a11y_consider_explicit_label -->
										<button on:click={() => toggleDropdown(colIndex, taskIndex)}>
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
										<span class="text-sm font-semibold text-white bg-blue-600 rounded px-2 py-1">
											{task.type}
										</span>
									{/if}
									<span class="text-xs text-gray-300">{task.id}</span>
								</div>
							</div>
						{/each}
					</div>
					{#if $addingTask === colIndex}
						<div class="mt-4 bg-gray-500 p-4 rounded-lg shadow-sm">
							<textarea
								class="w-full border-gray-300 p-2 rounded-lg text-sm"
								placeholder="Task title"
								bind:value={newTaskTitle}
							></textarea>
							<div class="mt-2 flex justify-between items-center">
								<input
									type="text"
									class="border-gray-300 p-2 rounded-lg text-sm flex-1 mr-2"
									placeholder="Type (e.g. feat, bug)"
									bind:value={newTaskType}
								/>
								<button
									class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
									on:click={() => addTask(colIndex)}
								>
									Create
								</button>
							</div>
						</div>
					{:else}
						<button
							class="mt-4 w-full bg-gray-500 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400"
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
