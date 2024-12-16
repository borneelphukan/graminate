<script lang="ts">
	type Notification = {
		title: string;
		description: string;
	};

	export let notifications: Notification[] = [];
	export let isOpen: boolean = false;
	export let closeNotificationBar: () => void = () => {};

	// State to manage dropdown visibility
	let isFilterDropdownOpen = false;
	let isActionsDropdownOpen = false;

	// Toggles for dropdowns
	function toggleFilterDropdown() {
		isFilterDropdownOpen = !isFilterDropdownOpen;
		isActionsDropdownOpen = false; // Close other dropdown
	}

	function toggleActionsDropdown() {
		isActionsDropdownOpen = !isActionsDropdownOpen;
		isFilterDropdownOpen = false; // Close other dropdown
	}
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
			class="text-gray-300 hover:bg-gray-400 p-1 rounded-full focus:outline-none"
			onclick={closeNotificationBar}
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
		<div class="flex items-center justify-between mb-2 relative">
			<div class="flex space-x-2">
				<!-- Filter Button -->
				<div class="relative">
					<button
						class="bg-gray-400 px-3 py-1 mb-1 text-sm rounded-md text-gray-700 hover:bg-gray-300 flex items-center"
						onclick={toggleFilterDropdown}
					>
						Filter
						<span class="ml-2">
							{#if isFilterDropdownOpen}
								<svg
									fill="#000000"
									height="12px"
									width="12px"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 330 330"
									xml:space="preserve"
								>
									<path
										id="XMLID_224_"
										d="M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394
	l-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393
	C307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z"
									/>
								</svg>
							{:else}
								<svg
									fill="#000000"
									height="12px"
									width="12px"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 330 330"
									xml:space="preserve"
								>
									<path
										id="XMLID_225_"
										d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
	c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
	s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
									/>
								</svg>
							{/if}
						</span>
					</button>
					{#if isFilterDropdownOpen}
						<div class="absolute mt-2 w-56 bg-white shadow-lg rounded-md border p-4">
							<p class="text-sm font-semibold text-gray-700 mb-2">Filter By</p>
							<label class="flex items-center space-x-2">
								<input type="checkbox" class="form-checkbox" />
								<span>Archived</span>
							</label>
							<hr class="my-3" />
							<p class="text-sm font-semibold text-gray-700 mb-2">Notifications</p>
							<label class="flex items-center space-x-2">
								<input type="checkbox" class="form-checkbox" />
								<span>Select all</span>
							</label>
							<div class="flex justify-between mt-4">
								<button class="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600">
									Done
								</button>
								<button class="border px-4 py-2 rounded-md text-gray-700 hover:bg-gray-100">
									Cancel
								</button>
							</div>
						</div>
					{/if}
				</div>

				<!-- Actions Button -->
				<div class="relative">
					<button
						class="bg-gray-400 px-3 py-1 mb-1 text-sm rounded-md text-gray-700 hover:bg-gray-300 flex items-center"
						onclick={toggleActionsDropdown}
					>
						Actions
						<span class="ml-2">
							{#if isActionsDropdownOpen}
								<svg
									fill="#000000"
									height="12px"
									width="12px"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 330 330"
									xml:space="preserve"
								>
									<path
										id="XMLID_224_"
										d="M325.606,229.393l-150.004-150C172.79,76.58,168.974,75,164.996,75c-3.979,0-7.794,1.581-10.607,4.394
	l-149.996,150c-5.858,5.858-5.858,15.355,0,21.213c5.857,5.857,15.355,5.858,21.213,0l139.39-139.393l139.397,139.393
	C307.322,253.536,311.161,255,315,255c3.839,0,7.678-1.464,10.607-4.394C331.464,244.748,331.464,235.251,325.606,229.393z"
									/>
								</svg>
							{:else}
								<svg
									fill="#000000"
									height="12px"
									width="12px"
									version="1.1"
									id="Layer_1"
									xmlns="http://www.w3.org/2000/svg"
									xmlns:xlink="http://www.w3.org/1999/xlink"
									viewBox="0 0 330 330"
									xml:space="preserve"
								>
									<path
										id="XMLID_225_"
										d="M325.607,79.393c-5.857-5.857-15.355-5.858-21.213,0.001l-139.39,139.393L25.607,79.393
	c-5.857-5.857-15.355-5.858-21.213,0.001c-5.858,5.858-5.858,15.355,0,21.213l150.004,150c2.813,2.813,6.628,4.393,10.606,4.393
	s7.794-1.581,10.606-4.394l149.996-150C331.465,94.749,331.465,85.251,325.607,79.393z"
									/>
								</svg>
							{/if}
						</span>
					</button>
					{#if isActionsDropdownOpen}
						<div class="absolute mt-2 w-56 bg-white shadow-lg rounded-md border p-3">
							<ul class="space-y-2">
								<li>
									<button
										class="text-gray-100 hover:bg-gray-400 w-full text-left flex items-center px-3 py-2 cursor-pointer transition-all duration-200 rounded-md"
									>
										Archive All
									</button>
								</li>
								<li>
									<button
										class="text-gray-100 hover:bg-gray-400 w-full text-left flex items-center px-3 py-2 cursor-pointer transition-all duration-200 rounded-md"
									>
										Mark All as Read
									</button>
								</li>
							</ul>
						</div>
					{/if}
				</div>
			</div>

			<!-- Settings Icon -->
			<!-- svelte-ignore a11y_consider_explicit_label -->
			<button class="text-green-200 hover:text-green-800 mb-2 focus:outline-none">
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
						d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
				</svg>
			</button>
		</div>

		<hr class="my-4 border-gray-200" />

		{#if notifications.length === 0}
			<p class="text-gray-100">You don’t have any notifications</p>

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
