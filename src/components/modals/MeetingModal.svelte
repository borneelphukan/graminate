<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import ScheduleCard from '../cards/ScheduleCard.svelte';

	const dispatch = createEventDispatcher();

	const close = () => {
		dispatch('close');
	};
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 bg-opacity-75">
	<div class="bg-white rounded-lg shadow-lg p-6 max-w-full max-h-full overflow-auto">
		<div class="flex justify-between items-center border-b pb-4 mb-4">
			<h2 class="text-xl font-bold text-gray-800">Choose Meeting Type</h2>
			<button class="text-gray-400 hover:text-gray-600" on:click={close} aria-label="Close Modal">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="w-6 h-6"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
				</svg>
			</button>
		</div>

		<div class="flex gap-4">
			<ScheduleCard
				title="One-on-One"
				description="Contacts can schedule a meeting with a single person on your team."
				imageSrc="/images/one-to-one.svg"
			/>
			<ScheduleCard
				title="Group"
				description="Contacts can schedule a meeting with multiple people on your team."
				imageSrc="/images/group.svg"
			/>
		</div>
	</div>
</div>
