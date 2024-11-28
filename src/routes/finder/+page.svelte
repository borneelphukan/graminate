<script lang="ts">
	import Maps from '../../components/others/Maps.svelte';

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
</script>

<Maps {apiKey} />
