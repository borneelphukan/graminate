<script lang="ts">
	import { writable } from 'svelte/store';

	const selectedDate = writable<Date>(new Date());

	const currentDate = new Date();
	let selectedMonth = currentDate.getMonth();
	let selectedYear = currentDate.getFullYear();

	function handleDateChange(date: Date | undefined) {
		if (date) {
			selectedDate.set(date);
			console.log('Selected Date:', date);
		}
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
	}

	function nextMonth() {
		if (selectedMonth === 11) {
			selectedMonth = 0;
			selectedYear += 1;
		} else {
			selectedMonth += 1;
		}
	}
</script>

<div
	class="bg-gradient-to-br from-gray-500 to-gray-400 rounded-lg shadow-lg p-6 w-full text-gray-200"
>
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
				class="size-6"
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
				class="size-6"
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
				{day === +$selectedDate.getDate() &&
				day !== null &&
				selectedMonth === $selectedDate.getMonth() &&
				selectedYear === $selectedDate.getFullYear()
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
