<script lang="ts">
	import Button from '../ui/Button.svelte';

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

	// Function to navigate back to the last visited page
	function goBack() {
		// Use history.back() to go to the previous page
		history.back();
	}
</script>

<div class="w-72 px-4 bg-gray-50 text-gray-800 border-r border-gray-400 min-h-screen -m-6">
	<!-- Back Button -->
	<div class="flex items-center pt-8">
		<Button text="Back" style="ghost" arrow="left" on:click={goBack} />
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
