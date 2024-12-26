<script lang="ts">
	import { writable, get } from 'svelte/store';

	import ClockPicker from './ClockPicker.svelte';
	import TextField from './TextField.svelte';
	import DropdownSmall from './Dropdown/DropdownSmall.svelte';

	let isClockVisible = false;
	const reminderStatus = [
		'At time of event',
		'5 minutes before',
		'10 minutes before',
		'15 minutes before',
		'30 minutes before',
		'1 hour before',
		'2 hours before',
		'1 day before',
		'2 days before',
		'1 week before'
	];

	type Task = { name: string; time: string };
	type Tasks = { [key: string]: Task[] };

	const tasks = writable<Tasks>({});

	const isBrowser = typeof window !== 'undefined';

	if (isBrowser) {
		const storedTasks = localStorage.getItem('tasks');
		if (storedTasks) {
			tasks.set(JSON.parse(storedTasks));
		}

		tasks.subscribe((value) => {
			localStorage.setItem('tasks', JSON.stringify(value));
		});
	}

	const selectedDate = writable<Date>(new Date());
	let newTask = '';
	let newTaskTime = '12:00 PM';
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

	let isTaskNameValid = true;

	function addTask() {
		if (!newTask.trim()) {
			isTaskNameValid = false;
			return;
		}

		isTaskNameValid = true;
		const today = new Date();
		const selected = get(selectedDate);

		if (selected < new Date(today.getFullYear(), today.getMonth(), today.getDate())) {
			alert('You cannot add tasks to past dates.');
			return;
		}

		const dateKey = selected.toISOString().split('T')[0];

		tasks.update((t) => {
			if (!t[dateKey]) {
				t[dateKey] = [];
			}
			t[dateKey].push({ name: newTask.trim(), time: newTaskTime });

			t[dateKey].sort((a, b) => {
				const timeA = convertTo24Hour(a.time);
				const timeB = convertTo24Hour(b.time);
				return (
					new Date(`1970-01-01T${timeA}`).getTime() - new Date(`1970-01-01T${timeB}`).getTime()
				);
			});
			return t;
		});

		newTask = '';
		newTaskTime = '12:00 PM';
		showAddTask = false;
		showTasks = true;
	}

	function removeTask(index: number) {
		const dateKey = get(selectedDate).toISOString().split('T')[0];

		tasks.update((t) => {
			if (t[dateKey]) {
				t[dateKey].splice(index, 1);

				if (t[dateKey].length === 0) {
					delete t[dateKey];
				}
			}
			return t;
		});
	}

	function convertTo24Hour(time: string): string {
		const [hoursMinutes, modifier] = time.split(' ');
		let [hours, minutes] = hoursMinutes.split(':').map(Number);

		if (modifier === 'PM' && hours < 12) {
			hours += 12;
		}
		if (modifier === 'AM' && hours === 12) {
			hours = 0;
		}

		return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
	}

	function generateCalendar(month: number, year: number) {
		const firstDayOfMonth = new Date(year, month, 1).getDay();
		const daysInMonth = new Date(year, month + 1, 0).getDate();

		const calendar = Array(firstDayOfMonth)
			.fill(null)
			.concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

		return calendar;
	}

	function handleTimeSelected(event: CustomEvent<{ time: string }>) {
		newTaskTime = event.detail.time;
		isClockVisible = false;
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
	function getDayStatus(date: typeof selectedDate): string {
		const today = new Date();
		const selected = get(date);

		const todayDateOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate());

		const tomorrowDateOnly = new Date(todayDateOnly);
		tomorrowDateOnly.setDate(todayDateOnly.getDate() + 1);

		if (selected.getTime() === todayDateOnly.getTime()) {
			return 'Today';
		} else if (selected.getTime() === tomorrowDateOnly.getTime()) {
			return 'Tomorrow';
		}

		return selected.toDateString();
	}
</script>

<div
	class="bg-gradient-to-br from-gray-500 to-gray-400 dark:from-gray-700 rounded-lg shadow-lg p-6 w-full dark:text-light relative"
>
	{#if showAddTask}
		<!-- Add Task Section -->
		<h3 class="text-lg font-bold mb-4 text-dark dark:text-light">
			Add Task for
			{#if getDayStatus(selectedDate)}
				today
			{:else}
				{get(selectedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}
			{/if}
		</h3>
		<div class="space-y-4">
			<TextField
				placeholder="Task name"
				bind:value={newTask}
				type={isTaskNameValid ? '' : 'error'}
				error_message="Task name cannot be empty"
			/>
			<div>
				<!-- Select Time -->
				<button
					class="w-full border border-gray-300 text-dark dark:text-light rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
					onclick={() => (isClockVisible = true)}
				>
					{newTaskTime}
				</button>
				{#if isClockVisible}
					<ClockPicker
						bind:selectedTime={newTaskTime}
						on:timeSelected={handleTimeSelected}
						on:cancel={() => (isClockVisible = false)}
					/>
				{/if}
			</div>
			<!-- Alert -->
			<div><DropdownSmall items={reminderStatus} label=" Alert" placeholder="None" /></div>
			<div class="flex space-x-4">
				<button
					class="bg-green-200 hover:bg-green-800 text-white px-4 py-2 rounded"
					onclick={addTask}
					disabled={!newTask.trim() || !newTaskTime.trim()}
				>
					Add
				</button>
				<button
					class="bg-gray-600 hover:bg-gray-800 text-white px-4 py-2 rounded"
					onclick={() => (showAddTask = false)}
				>
					Cancel
				</button>
			</div>
		</div>
	{:else if showTasks}
		<!-- Task List -->
		<h3 class="text-lg font-bold mb-4 text-dark dark:text-light">
			Tasks for {getDayStatus(selectedDate)}
		</h3>
		<ul class="list-disc pl-5 space-y-2">
			{#each $tasks[get(selectedDate).toISOString().split('T')[0]] || [] as task, index}
				<li class="flex items-center justify-between">
					<span>{task.time} - {task.name}</span>
					<button
						class="text-red-600 hover:text-red-800"
						onclick={() => removeTask(index)}
						aria-label="Remove task"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
						</svg>
					</button>
				</li>
			{/each}
		</ul>

		{#if !(get(tasks)[get(selectedDate).toISOString().split('T')[0]] || []).length}
			<p class="text-dark dark:text-light">Task list Empty</p>
		{/if}
		<div class="mt-4 flex space-x-4">
			<button
				aria-label="back to calendar"
				class="bg-green-200 hover:bg-green-100 text-white p-2 rounded"
				onclick={() => (showTasks = false)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-4"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
				</svg>
			</button>

			<button
				aria-label="add tasks"
				class="bg-gray-300 hover:bg-gray-200 text-white p-2 rounded-full"
				onclick={() => (showAddTask = true)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-4"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
				</svg>
			</button>
		</div>
	{:else}
		<!-- Calendar -->
		<div>
			<div class="flex items-center justify-between mb-4">
				<button
					class="text-gray-600 hover:text-gray-100 dark:text-gray-300 dark:hover:text-light px-2 focus:outline-none"
					onclick={previousMonth}
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
					<span class="text-lg font-semibold text-dark dark:text-light">
						{monthNames[selectedMonth]}
						{selectedYear}
					</span>
				</div>

				<button
					class="text-gray-200 hover:text-gray-100 dark:text-gray-300 dark:hover:text-light px-2 focus:outline-none"
					onclick={nextMonth}
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
				{#each ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as dayAbbreviation}
					<div
						class="flex items-center justify-center font-semibold text-sm text-dark dark:text-light"
					>
						{dayAbbreviation}
					</div>
				{/each}

				{#each calendarDays as day}
					<!-- svelte-ignore a11y_click_events_have_key_events -->
					<!-- svelte-ignore a11y_no_static_element_interactions -->
					<div
						class="flex text-dark dark:text-light items-center justify-center h-10 w-10 rounded-full text-center text-base font-medium cursor-pointer {day ===
							currentDate.getDate() &&
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
								? 'hover:bg-gray-300 dark:hover:bg-blue-100'
								: ''} 
						{day === null ? 'text-gray-400 dark:text-dark cursor-not-allowed' : ''}"
						onclick={() => day && handleDateChange(new Date(selectedYear, selectedMonth, day))}
					>
						{day || ''}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
