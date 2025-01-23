<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { derived } from 'svelte/store';
	import { t } from '@lib/i18n';
	import NavPanel from '@layout/NavPanel.svelte';
	import { locale } from 'svelte-i18n';

	const navButtons = [
		{ name: 'profile', view: 'profile' },
		{ name: 'weather', view: 'weather' },
		{ name: 'invoice', view: 'invoice' },
		{ name: 'calendar', view: 'calendar' },
		{ name: 'tasks', view: 'tasks' },
		{ name: 'security', view: 'security' }
	];

	const currentView = derived(page, ($page) => $page.url.searchParams.get('view') || 'profile');

	const changeView = (newView: string) => {
		goto(`?view=${newView}`);
	};
</script>

<svelte:head>
	<title>Graminate ERP - Settings</title>
</svelte:head>

<div class="flex min-h-screen">
	<main class="flex-1 px-4">
		{#if $locale}
			<div class="pb-4 font-bold text-lg text-dark dark:text-light">{$t('general')}</div>

			<NavPanel
				buttons={navButtons}
				activeView={$currentView}
				on:navigate={(e) => changeView(e.detail.view)}
			/>

			<section>
				<slot />
			</section>
		{:else}
			<div>Loading translations...</div>
		{/if}
	</main>
</div>
