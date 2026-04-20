export function loadGoogleMaps(apiKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== "undefined" && window.google.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;

    script.onload = () => resolve();
    script.onerror = (err) => reject(err);

    document.head.appendChild(script);
  });
}

export async function getCurrentLocation(): Promise<{ lat: number; lon: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        let msg = "An unknown location error occurred.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            msg = "Location permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            msg = "Location unavailable. Please check your GPS/network.";
            break;
          case error.TIMEOUT:
            msg = "Location request timed out.";
            break;
        }
        reject(msg);
      },
      { 
        enableHighAccuracy: false, 
        timeout: 10000, 
        maximumAge: 60000 
      }
    );
  });
}