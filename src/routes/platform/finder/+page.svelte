<script lang="ts">
	import Maps from '@others/Maps.svelte';
	import { onMount } from 'svelte';

	const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

	let mapState = {
		center: { lat: 51.1657, lng: 10.4515 },
		zoom: 6
	};

	let error: string | null = null;

	onMount(async () => {
		try {
			const location = await getCurrentLocation();
			mapState.center = { lat: location.lat, lng: location.lon };
			mapState.zoom = 12;
		} catch (err) {
			error = err as string;
		}
	});

	async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
		return new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				reject('Geolocation is not supported by your browser.');
				return;
			}
			navigator.geolocation.getCurrentPosition(
				(position) => {
					resolve({
						lat: position.coords.latitude,
						lon: position.coords.longitude
					});
				},
				() => {
					reject('Unable to fetch location. Please enable location services.');
				}
			);
		});
	}

	function handleMapStateChange(state: { center: google.maps.LatLngLiteral; zoom: number }) {
		mapState = state;
		console.log('Updated map state:', mapState);
	}
</script>

{#if error}
	<p class="text-red-500 text-center mt-4">{error}</p>
{:else}
	<Maps
		{apiKey}
		initialCenter={mapState.center}
		initialZoom={mapState.zoom}
		onStateChange={handleMapStateChange}
	/>
{/if}
