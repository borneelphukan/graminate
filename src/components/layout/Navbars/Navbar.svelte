<script lang="ts">
	import { goto } from '$app/navigation';
	import NotificationBar from '../NotificationBar.svelte';
	import ThemeSwitch from '@ui/ThemeSwitch.svelte';
	import { t } from '@lib/i18n';
	export let imageSrc: string = '/images/logo.png';

	function toggleThemeHandler() {
		console.log('Theme toggled');
	}

	let notificationCount: number = 0;
	let notifications = [
		{
			title: 'New Message.',
			description: 'You have a new message'
		},
		{ title: 'New customer request', description: 'A customer sent you a product request' }
	];
	let isNotificationBarOpen = false;

	const toggleNotificationBar = () => {
		isNotificationBarOpen = !isNotificationBarOpen;
	};

	const toUserPreferences = () => {
		goto('/platform/settings/general');
	};

	const user = {
		name: 'Borneel Bikash Phukan',
		email: 'borneelphukan@gmail.com',
		imageUrl: 'https://eu.ui-avatars.com/api/?name=Borneel+Phukan&size=250'
	};

	const userNavigation = [
		{ name: 'Account & Billing', href: '/account-billing' },
		{ name: 'Pricing & Features', href: '/pricing-features', external: true },
		{ name: 'Product Updates', href: '/product-updates' },
		{ name: 'Training & Services', href: '/training-services', external: true }
	];

	let isDropdownOpen: boolean = false;

	const toggleDropdown = () => {
		isDropdownOpen = !isDropdownOpen;
	};
</script>

<header class="bg-gray-800 py-2">
	<div class="mx-auto max-w-7xl px-2 sm:px-4 lg:divide-y lg:divide-gray-700 lg:px-8">
		<div class="relative flex h-12 py-1 justify-between">
			<!-- Logo Section -->
			<div class="relative z-10 flex px-2 lg:px-0">
				<div class="flex flex-shrink-0 items-center">
					<a href="/" class="flex flex-row items-center gap-4">
						<img src={imageSrc} alt="Graminate Logo" class="h-10 w-auto" />
						<span class=" text-bold text-3xl text-light">Graminate</span>
						<sup class=" text-bold text-lg text-light">ERP</sup>
					</a>
				</div>
			</div>

			<!-- Icons and Profile Dropdown Section -->
			<div class="hidden lg:relative lg:z-10 lg:ml-4 lg:flex lg:items-center">
				<!-- Icons Section -->
				<div class="flex items-center space-x-3 pr-4 border-r border-gray-700">
					<!-- Phone Icon -->
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button class="text-gray-400 focus:outline-none hover:bg-blue-100 p-2 rounded-md">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
							/>
						</svg>
					</button>

					<!-- Shop Icon -->
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button class="text-gray-400 focus:outline-none hover:bg-blue-100 p-2 rounded-md">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614m-16.5 0a3.004 3.004 0 0 1-.621-4.72l1.189-1.19A1.5 1.5 0 0 1 5.378 3h13.243a1.5 1.5 0 0 1 1.06.44l1.19 1.189a3 3 0 0 1-.621 4.72M6.75 18h3.75a.75.75 0 0 0 .75-.75V13.5a.75.75 0 0 0-.75-.75H6.75a.75.75 0 0 0-.75.75v3.75c0 .414.336.75.75.75Z"
							/>
						</svg>
					</button>

					<!-- Feedback Icon -->
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button class="text-gray-400 focus:outline-none hover:bg-blue-100 p-2 rounded-md">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z"
							/>
						</svg>
					</button>

					<!-- Settings Icon -->
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<button
						class="text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
						onclick={toUserPreferences}
					>
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

					<!-- Notifications Icon -->
					<!-- svelte-ignore a11y_consider_explicit_label -->
					<!-- Notifications Icon -->
					<button
						class="relative text-gray-400 hover:bg-blue-100 p-2 rounded-md focus:outline-none"
						onclick={toggleNotificationBar}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="1.5"
								d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
							/>
						</svg>
						{#if notificationCount > 0}
							<span
								class="absolute top-1 right-0 h-4 w-4 bg-red-600 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1"
							>
								{notificationCount}
							</span>
						{/if}
					</button>
				</div>

				<!-- Profile Dropdown Section -->
				<div class="relative ml-4 flex-shrink-0 flex items-center">
					<button
						class="relative flex rounded-full bg-gray-800 text-sm text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
						aria-expanded={isDropdownOpen}
						onclick={toggleDropdown}
					>
						<img class="h-7 w-7 rounded-full" src={user.imageUrl} alt={user.name} />
						<span class="sr-only">Open user menu</span>
					</button>
					<span class="ml-2 text-white text-sm font-medium">Borneel Bikash Phukan</span>
					<button
						class="ml-1 flex items-center text-gray-400 hover:text-white focus:outline-none"
						onclick={toggleDropdown}
					>
						{#if isDropdownOpen}
							<!-- Up Icon -->
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M5 15l7-7 7 7"
								/>
							</svg>
						{:else}
							<!-- Down Icon -->
							<svg
								class="h-5 w-5"
								xmlns="http://www.w3.org/2000/svg"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="1.5"
									d="M19 9l-7 7-7-7"
								/>
							</svg>
						{/if}
					</button>
					{#if isDropdownOpen}
						<div
							class="origin-top-right absolute right-0 top-16 w-96 rounded-md shadow-lg py-4 bg-white dark:bg-dark-100 ring-1 ring-black ring-opacity-5 focus:outline-none"
							role="menu"
							aria-orientation="vertical"
							aria-labelledby="user-menu"
						>
							<!-- Profile Section -->
							<div class="px-4 pb-3 border-b border-gray-300">
								<div class="flex items-center">
									<img class="h-12 w-12 rounded-full" src={user.imageUrl} alt={user.name} />
									<div class="ml-3 flex-1">
										<p class="text-lg font-semibold text-gray-100 dark:text-white">{user.name}</p>
										<p class="text-sm text-gray-300">{user.email}</p>
										<!-- Flex container for left-right alignment -->
										<div class="flex items-center justify-between">
											<a
												href="/platform/settings/general"
												class="text-sm font-medium text-green-600 hover:underline"
											>
												{$t('navbar.profile_preferences')}
											</a>
											<ThemeSwitch switchAction={toggleThemeHandler} />
										</div>
									</div>
								</div>
							</div>

							<!-- Share Feedback -->
							<a
								href="/feedback"
								class="flex items-center px-4 py-3 border-b border-gray-300 text-sm font-medium text-gray-200 dark:text-gray-500 hover:bg-gray-400 dark:hover:bg-gray-200"
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									stroke="currentColor"
									class="h-5 w-5 mr-2"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
									/>
								</svg>
								{$t('navbar.share_feedback')}
							</a>

							<!-- Invite Team -->
							<a
								href="/invite-team"
								class="flex items-center px-4 py-3 border-b border-gray-300 text-sm font-medium text-gray-200 dark:text-gray-500 hover:bg-gray-400 dark:hover:bg-gray-200"
							>
								<svg
									viewBox="0 0 24 24"
									xmlns="http://www.w3.org/2000/svg"
									class="h-5 w-5 mr-2 bg-white dark:bg-gray-500 rounded"
								>
									<path fill="none" d="M0 0h24v24H0z" />
									<path
										fill-rule="nonzero"
										d="M12 11a5 5 0 0 1 5 5v6h-2v-6a3 3 0 0 0-2.824-2.995L12 13a3 3 0 0 0-2.995 2.824L9 16v6H7v-6a5 5 0 0 1 5-5zm-6.5 3c.279 0 .55.033.81.094a5.947 5.947 0 0 0-.301 1.575L6 16v.086a1.492 1.492 0 0 0-.356-.08L5.5 16a1.5 1.5 0 0 0-1.493 1.356L4 17.5V22H2v-4.5A3.5 3.5 0 0 1 5.5 14zm13 0a3.5 3.5 0 0 1 3.5 3.5V22h-2v-4.5a1.5 1.5 0 0 0-1.356-1.493L18.5 16c-.175 0-.343.03-.5.085V16c0-.666-.108-1.306-.309-1.904.259-.063.53-.096.809-.096zm-13-6a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm13 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm-13 2a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zm13 0a.5.5 0 1 0 0 1 .5.5 0 0 0 0-1zM12 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4z"
									/>
								</svg>
								{$t('navbar.invite_team')}
							</a>
							<!-- Navigation Links -->
							<div class="px-4 py-3">
								{#each userNavigation as item}
									<a
										href={item.href}
										class="flex items-center mb-2 text-sm font-medium text-gray-200 dark:text-gray-500 hover:underline"
										target={item.external ? '_blank' : '_self'}
									>
										{item.name}
										{#if item.external}
											<svg
												class="h-4 w-4 text-gray-500 ml-1"
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke="currentColor"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M13 5l7 7m0 0l-7 7m7-7H6"
												/>
											</svg>
										{/if}
									</a>
								{/each}
							</div>

							<!-- Footer -->
							<div
								class="flex items-center justify-between px-4 py-3 text-sm text-gray-200 dark:text-gray-500 border-t border-gray-300"
							>
								<a href="/" class="hover:underline">{$t('navbar.sign_out')}</a>
								<a href="/privacy-policy" class="hover:underline">{$t('navbar.privacy_policy')}</a>
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</header>

<NotificationBar
	{notifications}
	isOpen={isNotificationBarOpen}
	closeNotificationBar={toggleNotificationBar}
/>
