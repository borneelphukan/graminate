<script lang="ts">
	import { t } from '../../lib/i18n';
	import Button from '../ui/Button.svelte';

	type MenuItem = {
		label: string;
		href?: string;
		subItems?: MenuItem[];
	};

	const settingsMenu: MenuItem[] = [
		{
			label: 'your_preferences',
			subItems: [
				{ label: 'general', href: '/platform/settings/general/' },
				{ label: 'notifications', href: '/platform/settings/notifications' }
			]
		},
		{
			label: 'account_management',
			subItems: [
				{ label: 'account_defaults', href: '/account/defaults' },
				{ label: 'users_and_teams', href: '/account/users-teams' },
				{ label: 'privacy_and_consent', href: '/account/privacy-consent' },
				{ label: 'security', href: '/account/security' }
			]
		},
		{
			label: 'tools',
			subItems: [
				{ label: 'meetings', href: '/tools/meetings' },
				{ label: 'content', href: '/tools/content' },
				{ label: 'payments', href: '/tools/payments' }
			]
		}
	];

	function goBack() {
		history.back();
	}
</script>

<div
	class="w-72 px-4 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-light border-r border-gray-400 dark:border-gray-200 min-h-screen -m-6"
>
	<!-- Back Button -->
	<div class="flex items-center pt-4">
		<Button text={$t('back')} style="ghost" arrow="left" on:click={goBack} />
	</div>

	<!-- Settings Header -->
	<div class="px-4 py-2 text-xl font-semibold">{$t('settings')}</div>

	<!-- Menu Items -->
	<div class="px-4">
		{#each settingsMenu as menu}
			<div class="mt-4">
				<!-- Main Section Title -->
				{#if menu.subItems}
					<div class="text-medium font-semibold text-gray-600 dark:text-light">
						{$t(menu.label)}
					</div>
					<ul class="mt-2 space-y-2">
						{#each menu.subItems as subItem}
							<li>
								<a
									href={subItem.href || '#'}
									class="block px-2 py-1 text-sm text-gray-700 rounded hover:bg-gray-400 dark:text-gray-300 dark:hover:bg-blue-100"
								>
									{$t(subItem.label)}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<a
						href={menu.href || '#'}
						class="block px-2 py-1 text-sm font-medium text-gray-700 rounded hover:bg-gray-400"
					>
						{$t(menu.label)}
					</a>
				{/if}
			</div>
		{/each}
	</div>
</div>
