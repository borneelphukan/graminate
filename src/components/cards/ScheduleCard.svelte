<script lang="ts">
	export let title: string = 'One-on-One';
	export let description: string =
		'Contacts can schedule a meeting with a single person on your team.';
	export let imageSrc: string = '/images/female-avatar.svg';
</script>

<div class="border rounded-lg p-6 flex flex-col items-center text-center max-w-sm mx-auto">
	<img src={imageSrc} alt={title} class="w-20 h-20 mb-4 rounded-full" />
	<h3 class="text-xl font-semibold text-gray-100 mb-2">{title}</h3>
	<p class="text-gray-600 text-sm">{description}</p>
</div>
