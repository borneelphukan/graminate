<script lang="ts">
	import {
		faFacebookF,
		faXTwitter,
		faLinkedin,
		faGithub,
		faInstagram
	} from '@fortawesome/free-brands-svg-icons';
	import { faPhone } from '@fortawesome/free-solid-svg-icons';
	import { FontAwesomeIcon } from '@fortawesome/svelte-fontawesome';

	const navigation = {
		community: [
			{ key: 'Training Centers', href: 'http://localhost:5174/training-centers' },
			{ key: 'Documentation Guide', href: 'http://localhost:5174/documentation' },
			{ key: 'Download', href: 'http://localhost:5174/downloads' }
		],
		services: [
			{ key: 'GramShop', href: '/gramshop' },
			{ key: 'GramNews', href: '/gramnews' },
			{ key: 'Become a Partner', href: 'http://localhost:5174/become-partner' },
			{ key: 'Pricing', href: 'http://localhost:5174/pricing' },
			{ key: 'Support', href: 'http://localhost:5174/support' }
		],
		aboutUs: [
			{ key: 'Our Company', href: 'http://localhost:5174/our-company' },
			{ key: 'Careers', href: 'http://localhost:5174/career' },
			{ key: 'News', href: 'http://localhost:5174/news' },
			{ key: 'Events & Media', href: 'http://localhost:5174/events-media' },
			{ key: 'Contact Us', href: 'http://localhost:5174/contact-us' }
		]
	};
</script>

<footer class="bg-gray-900">
	<div class="mx-auto max-w-7xl px-6 py-4 sm:pt-12 sm:pb-16 lg:px-8">
		<div class="xl:grid xl:grid-cols-3 xl:gap-8">
			<div class="space-y-2">
				<h2 class="text-left text-3xl font-semibold text-white">
					Graminate <sup class="text-sm">ERP</sup>
				</h2>
				<p class="text-sm/6 text-balance text-gray-300">
					Graminate is a suite of business apps that cover all your agricultural company needs: CRM,
					eCommerce, accounting, inventory, project management, etc.
				</p>
				<div class="flex gap-x-8 pt-6">
					<a href="https://facebook.com" target="_blank" aria-label="Facebook">
						<FontAwesomeIcon icon={faFacebookF} class="h-5 w-5 text-gray-300 hover:text-white" />
					</a>
					<a href="https://x.com" target="_blank" aria-label="X">
						<FontAwesomeIcon icon={faXTwitter} class="h-5 w-5 text-gray-300 hover:text-white" />
					</a>
					<a href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
						<FontAwesomeIcon icon={faLinkedin} class="h-5 w-5 text-gray-300 hover:text-white" />
					</a>
					<a href="https://github.com" target="_blank" aria-label="GitHub">
						<FontAwesomeIcon icon={faGithub} class="h-5 w-5 text-gray-300 hover:text-white" />
					</a>
					<a href="https://instagram.com" target="_blank" aria-label="Instagram">
						<FontAwesomeIcon icon={faInstagram} class="h-5 w-5 text-gray-300 hover:text-white" />
					</a>
					<a href="tel:+4917671259396" aria-label="Phone">
						<FontAwesomeIcon icon={faPhone} class="h-5 w-5 text-gray-300 hover:text-white" />
					</a>
				</div>
			</div>

			<div class="mt-16 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0 xl:grid-cols-3">
				<div class="col-span-1">
					<h3 class="text-sm/6 font-semibold text-white">Community</h3>
					<ul role="list" class="mt-2 space-y-2">
						{#each navigation.community as item (item.key)}
							<li>
								<a href={item.href} class="text-sm/6 text-gray-300 hover:text-white">
									{item.key}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div class="col-span-1">
					<h3 class="text-sm/6 font-semibold text-white">Services</h3>
					<ul role="list" class="mt-2 space-y-2">
						{#each navigation.services as item (item.key)}
							<li>
								<a href={item.href} class="text-sm/6 text-gray-300 hover:text-white">
									{item.key}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<div class="col-span-2 xl:col-span-1">
					<h3 class="text-sm/6 font-semibold text-white">About Us</h3>
					<ul role="list" class="mt-2 space-y-2">
						{#each navigation.aboutUs as item (item.key)}
							<li>
								<a href={item.href} class="text-sm/6 text-gray-300 hover:text-white">
									{item.key}
								</a>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</div>
	</div>
</footer>
