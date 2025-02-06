<!-- Update page with content -->
<script lang="ts">
	import MembersCard from '@cards/MembersCard.svelte';
	import Footer from '@layout/Footer.svelte';
	import HomeNavbar from '@layout/Navbars/HomeNavbar.svelte';

	const teamMembers = [
		{
			avatar: '/images/people/borneel.png',
			name: 'Borneel Bikash Phukan',
			role: 'CEO / CTO',
			description:
				'Web Developer with 3+ years of experience in building scalable web applications with robust backend infrastructures.',
			linkedin: 'https://www.linkedin.com/in/borneelphukan/',
			github: 'https://github.com/borneelphukan',
			website: 'https://borneelphukan.com/'
		}
	];
</script>

<svelte:head>
	<title>About Us</title>
</svelte:head>

<div class="bg-white">
	<HomeNavbar signIn={true} />

	<div class="bg-white">
		<main class="isolate">
			<!-- Hero section -->
			<div class="relative isolate -z-10">
				<div class="overflow-hidden">
					<div class="mx-auto max-w-7xl px-6 pt-36 pb-32 sm:pt-60 lg:px-8 lg:pt-32">
						<div class="mx-auto max-w-2xl gap-x-14 lg:mx-0 lg:flex lg:max-w-none lg:items-center">
							<div class="relative w-full lg:max-w-xl lg:shrink-0 xl:max-w-2xl">
								<h1 class="text-5xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
									We’re changing how farmers interact with clients and manage business to 10x growth
								</h1>
								<p class="mt-8 font-medium text-gray-200 sm:max-w-md sm:text-xl/8 lg:max-w-none">
									Cupidatat minim id magna ipsum sint dolor qui. Sunt sit in quis cupidatat mollit
									aute velit. Et labore commodo nulla aliqua proident mollit ullamco exercitation
									tempor. Sint aliqua anim nulla sunt mollit id pariatur in voluptate cillum. Eu
									voluptate tempor esse minim amet fugiat veniam occaecat aliqua.
								</p>
							</div>
							<div
								class="mt-14 flex justify-end gap-8 sm:-mt-44 sm:justify-start sm:pl-20 lg:mt-0 lg:pl-0"
							>
								<div
									class="ml-auto w-44 flex-none space-y-8 pt-32 sm:ml-0 sm:pt-80 lg:order-last lg:pt-36 xl:order-none xl:pt-80"
								>
									<div class="relative">
										<img
											src="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
											alt=""
											class="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div
											class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset"
										></div>
									</div>
								</div>
								<div class="mr-auto w-44 flex-none space-y-8 sm:mr-0 sm:pt-52 lg:pt-36">
									<div class="relative">
										<img
											src="https://images.unsplash.com/photo-1485217988980-11786ced9454?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
											alt=""
											class="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div
											class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset"
										></div>
									</div>
									<div class="relative">
										<img
											src="https://images.unsplash.com/photo-1559136555-9303baea8ebd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=focalpoint&fp-x=.4&w=396&h=528&q=80"
											alt=""
											class="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div
											class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset"
										></div>
									</div>
								</div>
								<div class="w-44 flex-none space-y-8 pt-32 sm:pt-0">
									<div class="relative">
										<img
											src="https://images.unsplash.com/photo-1670272504528-790c24957dda?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&crop=left&w=400&h=528&q=80"
											alt=""
											class="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div
											class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset"
										></div>
									</div>
									<div class="relative">
										<img
											src="https://images.unsplash.com/photo-1670272505284-8faba1c31f7d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&h=528&q=80"
											alt=""
											class="aspect-2/3 w-full rounded-xl bg-gray-900/5 object-cover shadow-lg"
										/>
										<div
											class="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-gray-900/10 ring-inset"
										></div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Content section -->
			<div class="mx-auto -mt-12 max-w-7xl px-6 sm:mt-0 lg:px-8 xl:-mt-8">
				<div class="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
					<h2 class="text-4xl font-semibold tracking-tight text-gray-200 sm:text-5xl">
						Our mission
					</h2>
					<div class="mt-6 flex flex-col gap-x-8 gap-y-20 lg:flex-row">
						<div class="lg:w-full lg:max-w-2xl lg:flex-auto">
							<p class="text-xl/8 text-gray-600">
								Aliquet nec orci mattis amet quisque ullamcorper neque, nibh sem. At arcu, sit dui
								mi, nibh dui, diam eget aliquam. Quisque id at vitae feugiat egestas ac. Diam nulla
								orci at in viverra scelerisque eget. Eleifend egestas fringilla sapien.
							</p>
							<p class="mt-10 max-w-xl text-base/7 text-gray-700">
								Faucibus commodo massa rhoncus, volutpat. Dignissim sed eget risus enim. Mattis
								mauris semper sed amet vitae sed turpis id. Id dolor praesent donec est. Odio
								penatibus risus viverra tellus varius sit neque erat velit. Faucibus commodo massa
								rhoncus, volutpat. Dignissim sed eget risus enim. Mattis mauris semper sed amet
								vitae sed turpis id.
							</p>
						</div>
						<div class="lg:flex lg:flex-auto lg:justify-center">
							<dl class="w-64 space-y-8 xl:w-80">
								<div class="flex flex-col-reverse gap-y-4">
									<dt class="text-base/7 text-gray-600">
										Supporting farmers and workers directly or indirectly
									</dt>
									<dd class="text-5xl font-semibold tracking-tight text-gray-900">30,000</dd>
								</div>

								<div class="flex flex-col-reverse gap-y-4">
									<dt class="text-base/7 text-gray-600">Seed fund investment</dt>
									<dd class="text-5xl font-semibold tracking-tight text-gray-900">$300,000</dd>
								</div>

								<div class="flex flex-col-reverse gap-y-4">
									<dt class="text-base/7 text-gray-600">Active Clients</dt>
									<dd class="text-5xl font-semibold tracking-tight text-gray-900">12</dd>
								</div>
							</dl>
						</div>
					</div>
				</div>
			</div>

			<!-- Image section -->
			<div class="mt-32 sm:mt-40 xl:mx-auto xl:max-w-7xl xl:px-8">
				<img
					src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2832&q=80"
					alt=""
					class="aspect-5/2 w-full object-cover xl:rounded-3xl"
				/>
			</div>

			<!-- Values section -->
			<div class="mx-auto mt-24 max-w-7xl px-6 sm:mt-24 lg:px-8">
				<div class="mx-auto max-w-2xl lg:mx-0">
					<h2 class="text-4xl font-semibold tracking-tight text-gray-100 sm:text-5xl">
						Our values
					</h2>
					<p class="mt-6 text-lg/8 text-gray-600">
						Lorem ipsum dolor sit amet consect adipisicing elit. Possimus magnam voluptatum
						cupiditate veritatis in accusamus quisquam.
					</p>
				</div>
				<dl
					class="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 text-base/7 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3"
				>
					<div>
						<dt class="font-semibold text-gray-900">Be world-class</dt>
						<dd class="mt-1 text-gray-600">
							Aut illo quae. Ut et harum ea animi natus. Culpa maiores et sed sint et magnam
							exercitationem quia. Ullam voluptas nihil vitae dicta molestiae et. Aliquid velit
							porro vero.
						</dd>
					</div>
					<div>
						<dt class="font-semibold text-gray-900">Share everything you know</dt>
						<dd class="mt-1 text-gray-600">
							Mollitia delectus a omnis. Quae velit aliquid. Qui nulla maxime adipisci illo id
							molestiae. Cumque cum ut minus rerum architecto magnam consequatur. Quia quaerat
							minima.
						</dd>
					</div>
					<div>
						<dt class="font-semibold text-gray-900">Always learning</dt>
						<dd class="mt-1 text-gray-600">
							Aut repellendus et officiis dolor possimus. Deserunt velit quasi sunt fuga error
							labore quia ipsum. Commodi autem voluptatem nam. Quos voluptatem totam.
						</dd>
					</div>
					<div>
						<dt class="font-semibold text-gray-900">Be supportive</dt>
						<dd class="mt-1 text-gray-600">
							Magnam provident veritatis odit. Vitae eligendi repellat non. Eum fugit impedit
							veritatis ducimus. Non qui aspernatur laudantium modi. Praesentium rerum error
							deserunt harum.
						</dd>
					</div>
					<div>
						<dt class="font-semibold text-gray-900">Take responsibility</dt>
						<dd class="mt-1 text-gray-600">
							Sit minus expedita quam in ullam molestiae dignissimos in harum. Tenetur dolorem iure.
							Non nesciunt dolorem veniam necessitatibus laboriosam voluptas perspiciatis error.
						</dd>
					</div>
					<div>
						<dt class="font-semibold text-gray-900">Enjoy downtime</dt>
						<dd class="mt-1 text-gray-600">
							Ipsa in earum deserunt aut. Quos minus aut animi et soluta. Ipsum dicta ut quia eius.
							Possimus reprehenderit iste aspernatur ut est velit consequatur distinctio.
						</dd>
					</div>
				</dl>
			</div>

			<!-- Logo cloud -->
			<div class="relative isolate -z-10 my-24 sm:my-24">
				<div
					class="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 justify-center overflow-hidden [mask-image:radial-gradient(50%_45%_at_50%_55%,white,transparent)]"
				></div>
				<div class="mx-auto max-w-7xl px-6 lg:px-8">
					<h2 class="text-center text-lg/8 font-semibold text-gray-100">
						Trusted by the world’s most innovative teams
					</h2>
					<div
						class="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5"
					>
						<img
							class="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
							src="https://tailwindui.com/plus/img/logos/158x48/transistor-logo-gray-900.svg"
							alt="Transistor"
							width="158"
							height="48"
						/>
						<img
							class="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
							src="https://tailwindui.com/plus/img/logos/158x48/reform-logo-gray-900.svg"
							alt="Reform"
							width="158"
							height="48"
						/>
						<img
							class="col-span-2 max-h-12 w-full object-contain lg:col-span-1"
							src="https://tailwindui.com/plus/img/logos/158x48/tuple-logo-gray-900.svg"
							alt="Tuple"
							width="158"
							height="48"
						/>
						<img
							class="col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1"
							src="https://tailwindui.com/plus/img/logos/158x48/savvycal-logo-gray-900.svg"
							alt="SavvyCal"
							width="158"
							height="48"
						/>
						<img
							class="col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1"
							src="https://tailwindui.com/plus/img/logos/158x48/statamic-logo-gray-900.svg"
							alt="Statamic"
							width="158"
							height="48"
						/>
					</div>
				</div>
			</div>

			<!-- Team section -->
			<div class="mx-auto my-24 max-w-7xl px-6 sm:my-24 lg:px-8">
				<div class="flex items-center justify-center">
					<div class="max-w-2xl text-center">
						<h2 class="text-xl font-semibold uppercase text-dark sm:text-xl">Our team</h2>
						<p class="mt-6 text-lg/8 text-gray-600">
							We’re a dynamic group of individuals who are passionate about what we do and dedicated
							to delivering the best results for our clients.
						</p>
					</div>
				</div>
				<div class="flex flex-col gap-2">
					<ul
						role="list"
						class="mx-auto mt-12 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-8 sm:grid-cols-2 md:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-4"
					>
						{#each teamMembers as member}
							<li>
								<MembersCard
									avatar={member.avatar}
									name={member.name}
									role={member.role}
									description={member.description}
									linkedin={member.linkedin}
									github={member.github}
									website={member.website}
								/>
							</li>
						{/each}
					</ul>
				</div>
			</div>
		</main>
	</div>

	<!-- Footer -->
	<Footer />
</div>
