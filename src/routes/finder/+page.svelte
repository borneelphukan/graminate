<script lang="ts">
	import Maps from '../../components/others/Maps.svelte';

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	let mapState = {
		center: { lat: 51.1657, lng: 10.4515 },
		zoom: 6
	};

	function handleMapStateChange(state: { center: google.maps.LatLngLiteral; zoom: number }) {
		mapState = state;
		console.log('Updated map state:', mapState);
	}
</script>

<Maps
	{apiKey}
	initialCenter={mapState.center}
	initialZoom={mapState.zoom}
	onStateChange={handleMapStateChange}
/>
