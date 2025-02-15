<script lang="ts">
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';
	import Footer from '@layout/Footer.svelte';
	import FeatureCard from '../../components/cards/FeatureCard.svelte';
	import JobCard from '@cards/JobCard.svelte';
	import { onMount } from 'svelte';

	type Job = {
		id: number;
		position: string;
		type: string;
		mode: string;
		description: string;
		tasks: string[];
		requirements: string[];
		benefits: string[];
	};

	let jobs: Job[] = [];

	onMount(async () => {
		try {
			const res = await fetch('http://localhost:3000/api/jobs/jobs/');
			const data = await res.json();
			if (res.ok && Array.isArray(data.jobs)) {
				jobs = data.jobs;
			} else {
				console.error('Failed to fetch jobs:', data.error);
			}
		} catch (error) {
			console.error('Error fetching jobs:', error);
		}
	});

	const features = [
		{
			title: 'Growth',
			icon: 'M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941',
			description: [
				'Graminate is the fastest growing ERP platform for farmers actively contributing to India`s agricultural growth story.',
				'Each employee has their own area of responsibility for their projects and works closely with their own team as well as across departments.',
				'Grow into your position with us and take advantage of the development opportunities!'
			]
		},
		{
			title: 'Challenge',
			icon: 'M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18',
			description: [
				'India’s demographic landscape is evolving, driving an unprecedented demand for agricultural products. Graminate is committed to supporting this growth by leading the way in digital innovation.',
				'Our success is powered by a passionate and creative team that stays ahead of the curve, ensuring Graminate’s strong presence in India`s agricultural growth.',
				'Be part of this journey—embrace the challenge and grow with us!'
			]
		},
		{
			title: 'Passion',
			icon: 'M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z',
			description: [
				'We live golf and community. Our passion is what drives us. Together we want to drive golf forward and create a virtual community.',
				'In short: we want to become the digital home for golfers.'
			]
		}
	];

	const ctaItems = [
		'Flat hierarchies',
		'Short Decision-making Processes',
		'Young and Dynamic Team',
		'Plenty of scope for your own ideas',
		'Diverse Development Opportunities',
		'On Site or Remote'
	];
</script>

<svelte:head>
	<title>Jobs at Graminate</title>
</svelte:head>
<HomeNavbar signIn/>

<!-- Header -->
<div class="relative bg-gray-500">
	<div class="relative isolate overflow-hidden pt-1">
		<div class="mx-auto max-w-2xl pb-5 pt-16 sm:pb-5 sm:pt-16 lg:pb-16 lg:pt-10 text-center">
			<h1 class="text-5xl font-bold sm:text-5xl text-gray-200">Careers</h1>
		</div>
	</div>
</div>

<!-- Feature Section -->
<div class="py-24 sm:py-12">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<h2 class="text-base font-semibold leading-7 text-emerald-600">Become part of our Team</h2>
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
				Three Reasons for joining Graminate
			</p>
		</div>
		<div class="mt-16 grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
			{#each features as feature}
				<FeatureCard {feature} />
			{/each}
		</div>
	</div>
</div>

<!-- Call to Action -->
<div class="bg-gray-500 py-12">
	<div class="mx-auto max-w-7xl sm:px-6 lg:px-8">
		<div
			class="mx-auto max-w-2xl flex flex-col gap-16 bg-white/5 px-6 py-16 ring-1 ring-white/10 sm:rounded-3xl sm:p-8 lg:max-w-none lg:flex-row lg:items-center lg:py-20 xl:gap-x-20 xl:px-20"
		>
			<div class="w-full flex-auto">
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Become part of the team</h2>
				<ul class="mt-10 grid grid-cols-1 gap-x-8 gap-y-3 text-base leading-7 sm:grid-cols-2">
					{#each ctaItems as item}
						<li class="flex gap-x-3">
							<svg
								class="h-7 w-5 flex-none text-green-200"
								viewBox="0 0 20 20"
								fill="currentColor"
								aria-hidden="true"
							>
								<path
									fill-rule="evenodd"
									d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
									clip-rule="evenodd"
								/>
							</svg>
							{item}
						</li>
					{/each}
				</ul>
			</div>
		</div>
	</div>
</div>

<!-- Available Jobs -->
<div class="py-24 sm:py-12">
	<div class="mx-auto max-w-7xl px-6 lg:px-8">
		<div class="mx-auto max-w-2xl lg:text-center">
			<p class="mt-2 text-3xl font-bold tracking-tight text-gray-200 sm:text-4xl">
				Available Positions
			</p>
		</div>
		<!-- Job Cards Grid -->
		<div class="max-w-5xl mx-auto">
			{#if jobs.length > 0}
				<div class="mt-10 grid gap-6">
					{#each jobs as job}
						<JobCard
							position={job.position}
							type={job.type}
							mode={job.mode}
							description={job.description}
							tasks={job.tasks}
							requirements={job.requirements}
							benefits={job.benefits}
						/>
					{/each}
				</div>
			{:else}
				<p class="mt-10 text-center text-gray-300 text-xl">No vacancies available at the moment.</p>
			{/if}
		</div>
	</div>
</div>

<Footer />
