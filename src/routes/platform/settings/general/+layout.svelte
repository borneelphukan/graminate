<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { derived } from 'svelte/store';
	import NavPanel from '../../../../components/layout/NavPanel.svelte';
	import Button from '../../../../components/ui/Button.svelte';

	const navButtons = [
		{ name: 'Profile', view: 'profile' },
		{ name: 'Weather', view: 'weather' },
		{ name: 'Milestones', view: 'milestones' },
		{ name: 'Calendar', view: 'calendar' },
		{ name: 'Tasks', view: 'tasks' },
		{ name: 'Security', view: 'security' }
	];

	// Get the current view from the URL query
	const currentView = derived(page, ($page) => $page.url.searchParams.get('view') || 'profile');

	// Function to change the view
	const changeView = (newView: string) => {
		goto(`?view=${newView}`);
	};
</script>

<svelte:head>
	<title>Settings</title>
</svelte:head>

<div class="flex min-h-screen">
	<main class="flex-1 px-4">
		<div class="pb-4 font-bold text-lg">General</div>

		<!-- NavPanel -->
		<NavPanel
			buttons={navButtons}
			activeView={$currentView}
			on:navigate={(e) => changeView(e.detail.view)}
		/>

		<!-- Page Content -->
		<section>
			<slot />
		</section>

	</main>
</div>
