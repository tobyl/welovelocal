<script>
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  export let providers = [];
  export let activeCategories = new Set();
  export let onselect = () => {};
  export let ondeselect = () => {};

  let mapContainer;
  let map;
  let markers = [];

  const CATEGORY_COLORS = {
    'farm': '#2d7a2d',
    'roadside-stand': '#e07b00',
    'market': '#7b3fa0',
  };

  const CATEGORY_ICONS = {
    'farm': '🌾',
    'roadside-stand': '🥕',
    'market': '🏪',
  };

  function createMarkerEl(provider) {
    const el = document.createElement('div');
    el.className = 'map-marker';
    el.style.setProperty('--color', CATEGORY_COLORS[provider.category] ?? '#555');
    el.title = provider.name;
    const inner = document.createElement('span');
    inner.className = 'map-marker-inner';
    inner.textContent = CATEGORY_ICONS[provider.category] ?? '📍';
    el.appendChild(inner);
    return el;
  }

  function renderMarkers() {
    markers.forEach(m => m.remove());
    markers = [];

    for (const provider of providers) {
      if (!activeCategories.has(provider.category)) continue;

      const el = createMarkerEl(provider);
      el.addEventListener('click', (e) => { e.stopPropagation(); onselect(provider); });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([provider.lng, provider.lat])
        .addTo(map);

      markers.push(marker);
    }
  }

  $: if (map && providers && activeCategories) {
    renderMarkers();
  }

  onMount(() => {
    map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-82.9, 42.15],
      zoom: 9.5,
      attributionControl: false,
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), 'bottom-right');

    map.on('load', renderMarkers);
    map.on('click', () => ondeselect());
  });

  onDestroy(() => {
    map?.remove();
  });
</script>

<div bind:this={mapContainer} class="map-container"></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
  }

  :global(.map-marker) {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    background: var(--color);
    border: 2px solid white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0,0,0,0.35);
  }

  :global(.map-marker-inner) {
    font-size: 16px;
    line-height: 1;
    transition: transform 0.15s ease;
  }

  :global(.map-marker:hover .map-marker-inner) {
    transform: scale(1.25);
  }
</style>
