<script lang="ts">
	import { Fa } from 'svelte-fa';
	import {
		faHome,
		faChartPie,
		faChartLine,
		faFolder,
		faWallet,
		faAddressBook,
		faCloud
	} from '@fortawesome/free-solid-svg-icons';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	export let isOpen: boolean;

	let isCollapsed = false;
	let expandedSection: string | null = null;

	const sections = [
		{
			icon: faHome,
			label: 'Dashboard',
			section: 'Dashboard',
			route: '/platform',
			subItems: []
		},
		{
			icon: faAddressBook,
			label: 'CRM',
			section: 'CRM',
			subItems: [
				{ label: 'Contacts', route: '/platform/contacts' },
				{ label: 'Companies', route: '/platform/contacts?view=companies' },
				{ label: 'Deals', route: '/platform/contacts?view=deals' },
				{ label: 'Tickets', route: '/platform/contacts?view=tickets' }
			]
		},
		{
			icon: faChartPie,
			label: 'Finder',
			section: 'Finder',
			route: '/platform/finder',
			subItems: []
		},
		{
			icon: faWallet,
			label: 'Commerce',
			section: 'Commerce',
			subItems: [
				{ label: 'Overview', route: '/platform/overview' },
				{ label: 'Payments', route: '/platform/payments' },
				{ label: 'Invoices', route: '/platform/contacts?view=invoices' },
				{ label: 'Payment Links', route: '/platform/payment-links' },
				{ label: 'Quotes', route: '/platform/quotes' },
				{ label: 'Products', route: '/platform/products' },
				{ label: 'Subscriptions', route: '/platform/subscriptions' }
			]
		},
		// {
		// 	icon: faShapes,
		// 	label: 'Automations',
		// 	section: 'Automations',
		// 	route: '/platform/automations',
		// 	subItems: []
		// },
		{
			icon: faChartLine,
			label: 'Commodity Prices',
			section: 'Commodity Prices',
			route: '/platform/commodity',
			subItems: []
		},
		{
			icon: faCloud,
			label: 'Weather Monitor',
			section: 'Weather Monitor',
			route: '/platform/weather',
			subItems: []
		},
		{
			icon: faFolder,
			label: 'Library',
			section: 'Library',
			subItems: [
				{ label: 'Meeting Scheduler', route: '/platform/meetings' },
				{ label: 'Documents', route: '/platform/documents' }
			]
		}
	];

	function navigateTo(route: string) {
		goto(route);
	}

	function handleSectionChange(section: string) {
		expandedSection = expandedSection === section ? null : section;
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function closeSubMenu() {
		expandedSection = null;
	}

	// Close submenu on outside click
	onMount(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const sidebar = document.querySelector('.sidebar');
			const navbar = document.querySelector('.navbar');

			if (
				(!sidebar || !sidebar.contains(event.target as Node)) &&
				(!navbar || !navbar.contains(event.target as Node))
			) {
				closeSubMenu();
			}
		};

		document.addEventListener('click', handleClickOutside);

		return () => {
			document.removeEventListener('click', handleClickOutside);
		};
	});
</script>

<div
	class="fixed py-3 inset-y-0 left-0 bg-gray-800 shadow-lg transform lg:translate-x-0 {isOpen
		? 'translate-x-0'
		: '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 lg:relative lg:translate-x-0 sidebar"
	style="width: {isCollapsed ? '60px' : '230px'}"
>
	<nav class="space-y-2 flex flex-col relative">
		{#each sections as { icon, label, section, route, subItems }}
			<div class="relative group">
				<!-- Main Section -->
				<!-- svelte-ignore a11y_click_events_have_key_events -->
				<!-- svelte-ignore a11y_no_static_element_interactions -->
				<div
					class="flex items-center mx-2 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-all duration-200 group"
					on:click={() => (route ? navigateTo(route) : handleSectionChange(section))}
					style="justify-content: {isCollapsed ? 'center' : 'flex-start'};"
				>
					<div class="text-gray-400 flex justify-center items-center w-6 h-6">
						<Fa {icon} />
					</div>
					{#if !isCollapsed}
						<span class="text-gray-500 font-light text-sm ml-2 flex-grow">{label}</span>
						{#if subItems.length > 0}
							<div
								class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200"
							>
								<svg
									fill="#ffffff"
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
										id="XMLID_222_"
										d="M250.606,154.389l-150-149.996c-5.857-5.858-15.355-5.858-21.213,0.001
                        c-5.857,5.858-5.857,15.355,0.001,21.213l139.393,139.39L79.393,304.394c-5.857,5.858-5.857,15.355,0.001,21.213
                        C82.322,328.536,86.161,330,90,330s7.678-1.464,10.607-4.394l149.999-150.004c2.814-2.813,4.394-6.628,4.394-10.606
                        C255,161.018,253.42,157.202,250.606,154.389z"
									/>
								</svg>
							</div>
						{/if}
					{/if}
				</div>

				<!-- Sub-Items -->
				{#if expandedSection === section && subItems.length > 0}
					<div
						class="absolute top-0 left-full bg-gray-800 shadow-lg rounded-md py-2 w-48 space-y-2"
						style="transform: translateX(10px);"
					>
						{#each subItems as { label, route }}
							<!-- svelte-ignore a11y_click_events_have_key_events -->
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="text-gray-400 text-sm py-2 px-4 mx-2 cursor-pointer hover:bg-blue-100 rounded-md"
								on:click={() => navigateTo(route)}
							>
								{label}
							</div>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</nav>

	<!-- Back Button -->
	<div class="absolute bottom-4 right-4">
		<button
			class="flex items-center justify-center p-1 rounded-full bg-gray-400 text-gray-800 dark:text-white shadow-lg"
			on:click={toggleCollapse}
		>
			{#if isCollapsed}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-4"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
				</svg>
			{/if}
			{#if !isCollapsed}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-4"
				>
					<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
				</svg>
			{/if}
		</button>
	</div>
</div>

<style>
	nav {
		align-items: stretch;
	}
	.flex {
		display: flex;
	}
</style>
