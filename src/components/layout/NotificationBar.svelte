<script lang="ts">
	type Notification = {
		title: string;
		description: string;
	};

	export let notifications: Notification[] = [];
	export let isOpen: boolean = false;
	export let closeNotificationBar: () => void = () => {};
</script>

<div
	class={`fixed top-0 right-0 w-full max-w-md bg-white shadow-md transform transition-transform ${
		isOpen ? 'translate-x-0' : 'translate-x-full'
	}`}
	style="height: 100vh; z-index: 50;"
>
	<div class="flex items-center justify-between p-4 border-b border-gray-200">
		<h2 class="text-lg font-semibold text-gray-800">Notifications</h2>
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<button
			class="text-gray-400 hover:text-gray-800 focus:outline-none"
			on:click={closeNotificationBar}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-6 w-6"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M6 18L18 6M6 6l12 12"
				/>
			</svg>
		</button>
	</div>

	<div class="p-4">
		{#if notifications.length === 0}
			<p class="text-gray-500">You don’t have any notifications</p>
			<div class="mt-4 bg-gray-50 p-3 border rounded-md">
				<p class="text-sm text-gray-600">
					Send better emails faster with RootWave’s productivity tools.
				</p>
				<button class="mt-3 w-full bg-orange-500 text-white py-2 rounded-md hover:bg-orange-600">
					Install email extension
				</button>
			</div>
		{:else}
			{#each notifications as notification}
				<div class="flex items-start space-x-3 mb-3 bg-gray-50 p-3 border rounded-md">
					<div class="flex-shrink-0 h-8 w-8 bg-gray-200 rounded-full"></div>
					<div>
						<p class="text-sm font-medium text-gray-800">{notification.title}</p>
						<p class="text-sm text-gray-600">{notification.description}</p>
					</div>
				</div>
			{/each}
		{/if}
	</div>
</div>
