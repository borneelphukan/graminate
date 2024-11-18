<script lang="ts">
	type MenuItem = {
		label: string;
		href?: string;
		subItems?: MenuItem[];
	};

	const settingsMenu: MenuItem[] = [
		{ label: 'Your Preferences', subItems: [{ label: 'General' }, { label: 'Notifications' }] },
		{
			label: 'Account Management',
			subItems: [
				{ label: 'Account Defaults' },
				{ label: 'Audit Log' },
				{ label: 'Users & Teams' },
				{ label: 'Tracking Code' },
				{ label: 'Privacy & Consent' },
				{ label: 'Security' }
			]
		},
		{
			label: 'Tools',
			subItems: [
				{ label: 'Meetings' },
				{ label: 'Calling' },
				{ label: 'Inbox' },
				{ label: 'Marketing' },
				{ label: 'Content' },
				{ label: 'Payments' }
			]
		}
	];
</script>

<div class="w-72 px-4 bg-gray-50 text-gray-800 border-r border-gray-400 min-h-screen -m-6">
	<!-- Back Button -->
	<div class=" py-3">
		<button class="flex items-center text-sm font-medium text-gray-600 hover:text-gray-900">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 mr-1"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
			</svg>
			Back
		</button>
	</div>

	<!-- Settings Header -->
	<div class="px-4 py-2 text-xl font-semibold">Settings</div>

	<!-- Menu Items -->
	<div class="px-4">
		{#each settingsMenu as menu}
			<div class="mt-4">
				<!-- Main Section Title -->
				{#if menu.subItems}
					<div class="text-medium font-semibold text-gray-600">{menu.label}</div>
					<ul class="mt-2 space-y-2">
						{#each menu.subItems as subItem}
							<li>
								<a
									href={subItem.href || '#'}
									class="block px-2 py-1 text-base text-gray-700 rounded hover:bg-gray-400"
								>
									{subItem.label}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<a
						href={menu.href || '#'}
						class="block px-2 py-1 text-sm font-medium text-gray-700 rounded hover:bg-gray-400"
					>
						{menu.label}
					</a>
				{/if}
			</div>
		{/each}
	</div>
</div>
