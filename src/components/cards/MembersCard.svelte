<script lang="ts">
	import linkedinIcon from '@icons/social/linkedin.svg';
	import githubIcon from '@icons/social/github.svg';
	import webIcon from '@icons/social/web.svg';
	export let avatar: string;
	export let name: string;
	export let role: string;
	export let description: string;
	export let linkedin: string;
	export let github: string;
	export let website: string;
</script>

<div class="container mx-auto">
	<div class="max-w-xl rounded overflow-hidden shadow-lg bg-white py-10 px-5">
		<div class="h-48 w-48 mx-auto rounded-full flex items-center justify-center overflow-hidden">
			<img
				class="hover:scale-125 transition-all duration-500 cursor-pointer w-full h-full object-cover"
				src={avatar}
				alt="Avatar"
			/>
		</div>

		<div class="px-6 py-4 text-center">
			<p class="text-normal text-gray-200 font-bold pt-2 transition-colors duration-300">
				{name}
			</p>
			<p class="font-semibold text-gray-200 text-sm mb-3">
				{role}
			</p>
			<p class="max-w-md mx-auto text-sm lg:text-gray-800">
				{description}
			</p>

			<div class="mt-10 flex justify-center space-x-4">
				{#if linkedin}
					<a href={linkedin} aria-label="Linkedin" target="_blank">
						<img src={linkedinIcon} alt="Linkedin" class="w-5 h-5" />
					</a>
				{/if}
				{#if github}
					<a href={github} target="_blank">
						<img src={githubIcon} alt="GitHub" class="w-5 h-5" />
					</a>
				{/if}
				{#if website}
					<a href={website} aria-label="website" target="_blank">
						<img src={webIcon} alt="GitHub" class="w-5 h-5" />
					</a>
				{/if}
			</div>
		</div>
	</div>
</div>
