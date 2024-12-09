<script lang="ts">
	import { writable, get } from 'svelte/store';

	type Tasks = { [key: string]: string[] };

	// Load tasks from localStorage or initialize with an empty object
	const tasks = writable<Tasks>(JSON.parse(localStorage.getItem('tasks') || '{}'));

	// Subscribe to the store and save changes to localStorage
	tasks.subscribe((value) => {
		localStorage.setItem('tasks', JSON.stringify(value));
	});

	const selectedDate = writable<Date>(new Date());
	let newTask = '';
	let showTasks = false;
	let showAddTask = false;

	const currentDate = new Date();
	let selectedMonth = currentDate.getMonth();
	let selectedYear = currentDate.getFullYear();

	function handleDateChange(date: Date | undefined) {
		if (date) {
			selectedDate.set(date);
			showTasks = true;
			showAddTask = false;
		}
	}

	function addTask() {
		// Get the current selected date as a key
		const dateKey = get(selectedDate).toISOString().split('T')[0];

		// Update the tasks store and prepend the new task
		tasks.update((t) => {
			if (!t[dateKey]) {
				t[dateKey] = [];
			}
			t[dateKey].unshift(newTask.trim()); // Add the task to the top
			return t;
		});

		newTask = '';
		showAddTask = false;
		showTasks = true; // Ensure task list is shown
	}

	function removeTask(index: number) {
		const dateKey = get(selectedDate).toISOString().split('T')[0];
		tasks.update((t) => {
			if (t[dateKey]) {
				t[dateKey].splice(index, 1); // Remove the task at the specified index
			}
			return t;
		});
	}

	function generateCalendar(month: number, year: number) {
		const firstDayOfMonth = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const calendar = Array(firstDayOfMonth)
			.fill(null)
			.concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

		return calendar;
	}

	$: calendarDays = generateCalendar(selectedMonth, selectedYear);

	const monthNames = [
		'January',
		'February',
		'March',
		'April',
		'May',
		'June',
		'July',
		'August',
		'September',
		'October',
		'November',
		'December'
	];

	function previousMonth() {
		if (selectedMonth === 0) {
			selectedMonth = 11;
			selectedYear -= 1;
		} else {
			selectedMonth -= 1;
		}
		showTasks = false;
		showAddTask = false;
	}

	function nextMonth() {
		if (selectedMonth === 11) {
			selectedMonth = 0;
			selectedYear += 1;
		} else {
			selectedMonth += 1;
		}
		showTasks = false;
		showAddTask = false;
	}
</script>

<div
	class="bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg shadow-lg p-6 w-full text-gray-200 relative"
>
	{#if showAddTask}
		<!-- Add Task Section -->
		<div class="bg-white text-black p-6 rounded-lg shadow-lg">
			<h3 class="text-lg font-bold mb-4">Add Task for {get(selectedDate).toDateString()}</h3>
			<div class="space-y-4">
				<input
					type="text"
					placeholder="Task name"
					bind:value={newTask}
					class="w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
				/>
				<div class="flex space-x-4">
					<button
						class="bg-green-600 hover:bg-green-800 text-white px-4 py-2 rounded"
						on:click={addTask}
						disabled={!newTask.trim()}
					>
						Add Task
					</button>
					<button
						class="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded"
						on:click={() => (showAddTask = false)}
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	{:else if showTasks}
		<!-- Task List -->
		<div class="bg-white text-black p-6 rounded-lg shadow-lg">
			<h3 class="text-lg font-bold mb-4">Tasks for {get(selectedDate).toDateString()}</h3>
			<ul class="list-disc pl-5 space-y-2">
				{#each get(tasks)[get(selectedDate).toISOString().split('T')[0]] || [] as task, index}
					<li class="flex items-center justify-between">
						<span>{task}</span>
						<button
							class="text-red-600 hover:text-red-800"
							on:click={() => removeTask(index)}
							aria-label="Remove task"
						>
							&times;
						</button>
					</li>
				{/each}
			</ul>
			{#if !(get(tasks)[get(selectedDate).toISOString().split('T')[0]] || []).length}
				<p>No tasks for this date.</p>
			{/if}
			<div class="mt-4 flex space-x-4">
				<button
					class="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded"
					on:click={() => (showTasks = false)}
				>
					Back
				</button>
				<button
					class="bg-blue-600 hover:bg-blue-800 text-white px-4 py-2 rounded"
					on:click={() => (showAddTask = true)}
				>
					+
				</button>
			</div>
		</div>
	{:else}
		<!-- Calendar -->
		<div>
			<div class="flex items-center justify-between mb-4">
				<button
					class="text-gray-600 hover:text-gray-100 px-2 focus:outline-none"
					on:click={previousMonth}
					aria-label="Previous month"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
					</svg>
				</button>

				<div class="flex items-center">
					<span class="text-lg font-semibold">
						{monthNames[selectedMonth]}
						{selectedYear}
					</span>
				</div>

				<button
					class="text-gray-600 hover:text-gray-100 px-2 focus:outline-none"
					on:click={nextMonth}
					aria-label="Next month"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="w-6 h-6"
					>
						<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
					</svg>
				</button>
			</div>

			<div class="grid grid-cols-7 gap-1">
				{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as dayAbbreviation, index}
					<div
						class="flex items-center justify-center font-semibold text-sm
						{index === 0 || index === 6 ? 'text-red-200' : 'text-gray-200'}"
					>
						{dayAbbreviation}
					</div>
				{/each}

				<!-- Calendar dates -->
				{#each calendarDays as day}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="flex items-center justify-center h-10 w-10 rounded-full text-center text-base font-medium cursor-pointer
						{day === currentDate.getDate() &&
						selectedMonth === currentDate.getMonth() &&
						selectedYear === currentDate.getFullYear()
							? 'text-red-200'
							: ''}
						{day === +get(selectedDate).getDate() &&
						day !== null &&
						selectedMonth === get(selectedDate).getMonth() &&
						selectedYear === get(selectedDate).getFullYear()
							? 'bg-green-200 text-white'
							: day !== null
								? 'hover:bg-gray-300'
								: ''} 
						{day === null ? 'text-gray-400 cursor-not-allowed' : ''}"
						on:click={() => day && handleDateChange(new Date(selectedYear, selectedMonth, day))}
					>
						{day || ''}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
