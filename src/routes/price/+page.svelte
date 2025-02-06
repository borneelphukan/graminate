<script lang="ts">
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';
	import PriceCard from '../../components/cards/PriceCard.svelte';
	import Footer from '@layout/Footer.svelte';

	import { writable } from 'svelte/store';
	import { slide } from 'svelte/transition';

	const faqs = [
		{
			question: "What's the best thing about Switzerland?",
			answer:
				"I don't know, but the flag is a big plus. Lorem ipsum dolor sit amet consectetur adipisicing elit. Quas cupiditate laboriosam fugiat."
		},
		{
			question: 'How do I change my plan later?',
			answer:
				'You can change your plan anytime from the settings page. Just select a new plan and confirm your choice.'
		},
		{
			question: 'What kind of support is included?',
			answer:
				'All plans include email support. Higher-tier plans include priority support with faster response times.'
		}
	];

	const faqOpen = writable(new Set<number>());

	const toggleFAQ = (index: number) => {
		faqOpen.update((set) => {
			const newSet = new Set(set);
			if (newSet.has(index)) {
				newSet.delete(index);
			} else {
				newSet.add(index);
			}
			return newSet;
		});
	};

	type Frequency = 'monthly' | 'annually';

	type FrequencyOption = {
		value: Frequency;
		label: string;
		priceSuffix: string;
	};

	type PricingTier = {
		name: string;
		id: string;
		href: string;
		price: Record<Frequency, string>;
		description: string;
		features: string[];
		mostPopular: boolean;
	};

	type Pricing = {
		frequencies: FrequencyOption[];
		tiers: PricingTier[];
	};

	const pricing: Pricing = {
		frequencies: [
			{ value: 'monthly', label: 'Monthly', priceSuffix: '/month' },
			{ value: 'annually', label: 'Annually', priceSuffix: '/year' }
		],
		tiers: [
			{
				name: 'Mini Pack',
				id: 'tier-mini',
				href: '#',
				price: { monthly: '₹75', annually: '₹900' },
				description: 'The essentials to provide your best work for clients.',
				features: [
					'5 products',
					'Up to 1,000 subscribers',
					'Basic analytics',
					'48-hour support response time'
				],
				mostPopular: false
			},
			{
				name: 'Regular Pack',
				id: 'tier-regular',
				href: '#',
				price: { monthly: '₹120', annually: '₹1440' },
				description: 'A plan that scales with your rapidly growing business.',
				features: [
					'25 products',
					'Up to 10,000 subscribers',
					'Advanced analytics',
					'24-hour support response time',
					'Marketing automations'
				],
				mostPopular: true
			},
			{
				name: 'Professional Pack',
				id: 'tier-professional',
				href: '#',
				price: { monthly: '₹240', annually: '₹2880' },
				description: 'Dedicated support and infrastructure for your company.',
				features: [
					'Unlimited products',
					'Unlimited subscribers',
					'Advanced analytics',
					'1-hour, dedicated support response time',
					'Marketing automations',
					'Custom reporting tools'
				],
				mostPopular: false
			}
		]
	};

	let frequency: FrequencyOption = pricing.frequencies[0];
	let selectedTier: PricingTier =
		pricing.tiers.find((tier) => tier.mostPopular) || pricing.tiers[0];
</script>

<svelte:head>
	<title>Pricing</title>
</svelte:head>
<HomeNavbar signIn={true} />
<div class="sm:pt-32 pt-16">
	<main>
		<div class="mx-auto max-w-7xl px-6 lg:px-8">
			<div class="mx-auto max-w-4xl text-center">
				<h1 class="text-base font-semibold leading-7 text-dark">Pricing</h1>
				<p class="mt-2 text-5xl font-semibold tracking-tight sm:text-6xl">
					Price tailored as per your needs
				</p>
			</div>
			<p
				class="mx-auto mt-6 max-w-2xl text-center text-lg font-medium text-gray-200 dark:text-gray-400 sm:text-xl"
			>
				Choose an affordable plan that’s packed with the best tools for better data analysis and
				more diverse sources
			</p>

			<div class="mt-16 flex justify-center">
				<fieldset aria-label="Payment frequency" class="flex">
					{#each pricing.frequencies as option}
						<label
							class="cursor-pointer px-3 py-2 rounded-full text-xs font-semibold leading-5"
							class:!bg-gray-400={frequency.value === option.value}
						>
							<input
								type="radio"
								bind:group={frequency}
								value={option}
								class="hidden"
								on:change={() => (frequency = option)}
							/>
							{option.label}
						</label>
					{/each}
				</fieldset>
			</div>

			<div
				class="isolate mx-auto mt-10 grid max-w-md grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3 mb-10"
			>
				{#each pricing.tiers as tier}
					<PriceCard
						label={tier.name}
						description={tier.description}
						price={tier.price[frequency.value]}
						priceSuffix={frequency.priceSuffix}
						points={tier.features}
						href={tier.href}
						popular={tier.mostPopular}
						isSelected={selectedTier.id === tier.id}
						onClick={() => (selectedTier = tier)}
					/>
				{/each}
			</div>
		</div>
	</main>
</div>

<!-- FAQ -->
<div class="bg-white">
	<div class="mx-auto max-w-7xl px-6 py-12 sm:py-16 lg:px-8 lg:py-20">
		<div class="mx-auto max-w-4xl">
			<h2 class="text-3xl font-semibold tracking-tight text-gray-900 sm:text-4xl">
				Frequently Asked Questions
			</h2>
			<dl class="mt-10 divide-y divide-gray-900/10">
				{#each faqs as faq, index}
					<div class="py-6 first:pt-0 last:pb-0">
						<dt>
							<button
								type="button"
								class="flex w-full items-start justify-between text-left text-gray-900 focus:outline-none"
								aria-controls={'faq-' + index}
								aria-expanded={$faqOpen.has(index)}
								on:click={() => toggleFAQ(index)}
							>
								<span class="text-base/7 font-semibold">{faq.question}</span>
								<span class="ml-6 flex h-7 items-center">
									<!-- Plus icon (only visible when closed) -->
									{#if !$faqOpen.has(index)}
										<svg
											class="size-6 transition-transform duration-200"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											aria-hidden="true"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v12m6-6H6" />
										</svg>
									{/if}

									<!-- Minus icon (only visible when open) -->
									{#if $faqOpen.has(index)}
										<svg
											class="size-6 transition-transform duration-200"
											fill="none"
											viewBox="0 0 24 24"
											stroke-width="1.5"
											stroke="currentColor"
											aria-hidden="true"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M18 12H6" />
										</svg>
									{/if}
								</span>
							</button>
						</dt>
						<!-- Answer section with smooth animation -->
						{#if $faqOpen.has(index)}
							<dd
								id={'faq-' + index}
								class="mt-2 pr-12 text-base/7 text-gray-600 transition-all duration-300 ease-in-out"
								transition:slide
							>
								<p>{faq.answer}</p>
							</dd>
						{/if}
					</div>
				{/each}
			</dl>
		</div>
	</div>
</div>

<Footer />
