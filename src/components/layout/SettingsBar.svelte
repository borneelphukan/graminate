<script lang="ts">
	import Button from '../ui/Button.svelte';

	type MenuItem = {
		label: string;
		href?: string;
		subItems?: MenuItem[];
	};

	const settingsMenu: MenuItem[] = [
		{
			label: 'Your Preferences',
			subItems: [
				{ label: 'General', href: '/platform/settings/general/' },
				{ label: 'Notifications', href: '/platform/settings/notifications' }
			]
		},
		{
			label: 'Account Management',
			subItems: [
				{ label: 'Account Defaults', href: '/account/defaults' },
				{ label: 'Audit Log', href: '/account/audit-log' },
				{ label: 'Users & Teams', href: '/account/users-teams' },
				{ label: 'Tracking Code', href: '/account/tracking-code' },
				{ label: 'Privacy & Consent', href: '/account/privacy-consent' },
				{ label: 'Security', href: '/account/security' }
			]
		},
		{
			label: 'Tools',
			subItems: [
				{ label: 'Meetings', href: '/tools/meetings' },
				{ label: 'Content', href: '/tools/content' },
				{ label: 'Payments', href: '/tools/payments' }
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
	<div class="flex items-center pt-4">
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
									class="block px-2 py-1 text-sm text-gray-700 rounded hover:bg-gray-400"
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
