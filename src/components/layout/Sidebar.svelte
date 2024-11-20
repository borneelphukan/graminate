<script lang="ts">
	import { Fa } from 'svelte-fa';
	import {
		faHome,
		faChartPie,
		faChartLine,
		faFolder,
		faDatabase,
		faShapes,
		faWallet,
		faBullhorn,
		faAddressBook
	} from '@fortawesome/free-solid-svg-icons';
	import { goto } from '$app/navigation';

	export let isOpen: boolean;
	export let toggleSidebar: () => void;

	let isCollapsed = false;
	let expandedSection: string | null = null;

	const sections = [
		{
			icon: faHome,
			label: 'Dashboard',
			section: 'Dashboard',
			subItems: [{ label: 'Help Desk', route: '/help-desk' }]
		},
		{
			icon: faAddressBook,
			label: 'CRM',
			section: 'CRM',
			subItems: [
				{ label: 'Contacts', route: '/contacts' },
				{ label: 'Companies', route: '/contacts?view=companies' },
				{ label: 'Deals', route: '/contacts?view=deals' },
				{ label: 'Tickets', route: '/contacts?view=tickets' }
			]
		},
		{
			icon: faBullhorn,
			label: 'Marketing',
			section: 'Marketing',
			subItems: [
				{ label: 'Campaigns', route: '/campaigns' },
				{ label: 'Email', route: '/email' },
				{ label: 'Social', route: '/social' },
				{ label: 'Ads', route: '/ads' },
				{ label: 'Forms', route: '/forms' },
				{ label: 'Buyer Intent', route: '/buyer-intent' }
			]
		},
		{
			icon: faChartPie,
			label: 'Content',
			section: 'Content',
			subItems: []
		},
		{
			icon: faWallet,
			label: 'Commerce',
			section: 'Commerce',
			subItems: [
				{ label: 'Overview', route: '/overview' },
				{ label: 'Payments', route: '/payments' },
				{ label: 'Invoices', route: '/contacts?view=invoices' },
				{ label: 'Payment Links', route: '/payment-links' },
				{ label: 'Quotes', route: '/quotes' },
				{ label: 'Products', route: '/products' },
				{ label: 'Subscriptions', route: '/subscriptions' }
			]
		},
		{
			icon: faShapes,
			label: 'Automations',
			section: 'Automations',
			subItems: []
		},
		{
			icon: faChartLine,
			label: 'Reporting',
			section: 'Reporting',
			subItems: []
		},
		{
			icon: faDatabase,
			label: 'Data Management',
			section: 'Data Management',
			subItems: []
		},
		{
			icon: faFolder,
			label: 'Library',
			section: 'Library',
			subItems: [
				{ label: 'Meeting Scheduler', route: '/meeting-scheduler' },
				{ label: 'Documents', route: '/documents' }
			]
		}
	];

	function handleSectionChange(section: string) {
		expandedSection = expandedSection === section ? null : section;
	}

	function toggleCollapse() {
		isCollapsed = !isCollapsed;
	}

	function navigateTo(route: string) {
		goto(route);
	}
</script>

<div
	class="fixed py-3 inset-y-0 left-0 bg-gray-800 shadow-lg transform lg:translate-x-0 {isOpen
		? 'translate-x-0'
		: '-translate-x-full'} transition-transform duration-300 ease-in-out z-50 lg:relative lg:translate-x-0"
	style="width: {isCollapsed ? '60px' : '230px'}"
>
	<nav class="space-y-2  flex flex-col relative">
		{#each sections as { icon, label, section, subItems }}
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_static_element_interactions -->
			<div class="relative group">
				<!-- Main Section -->
				<div
					class="flex items-center mx-2 p-3 rounded-lg cursor-pointer hover:bg-blue-100 transition-all duration-200 group"
					on:click={() => handleSectionChange(section)}
					style="justify-content: {isCollapsed ? 'center' : 'flex-start'};"
				>
					<div class="text-gray-400 flex justify-center items-center w-6 h-6">
						<Fa {icon} />
					</div>
					{#if !isCollapsed}
						<span class="text-gray-500 font-light text-base ml-2 flex-grow">{label}</span>
						<div class="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
				</div>

				<!-- Sub-Items -->
				{#if expandedSection === section && subItems.length > 0}
					<div
						class="absolute top-0 left-full bg-gray-800 shadow-lg rounded-md py-2 w-48 space-y-2"
						style="transform: translateX(10px);"
					>
						{#each subItems as { label, route }}
							<div
								class="text-gray-400 text-base py-2 px-4 mx-2 cursor-pointer hover:bg-blue-100 rounded-md"
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
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
					/>
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
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
					/>
				</svg>
			{/if}
		</button>
	</div>
	<button class="absolute top-4 right-4 text-gray-600 lg:hidden" on:click={toggleSidebar}>
		✕
	</button>
</div>

<style>
	nav {
		align-items: stretch;
	}
	.flex {
		display: flex;
	}
</style>
