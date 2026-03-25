<script>
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  export let providers = [];
  export let activeCategories = new Set();

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

      const popup = new maplibregl.Popup({ offset: 20, maxWidth: '260px' }).setHTML(`
        <div class="popup-content">
          <strong>${provider.name}</strong>
          <span class="popup-tag">${provider.category.replace('-', ' ')}</span>
          ${provider.subcategory !== 'mixed' ? `<span class="popup-tag popup-tag--sub">${provider.subcategory}</span>` : ''}
          ${provider.seasonal ? `<span class="popup-tag popup-tag--seasonal">Seasonal</span>` : ''}
          <p>${provider.description}</p>
          <small>${provider.address}</small>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([provider.lng, provider.lat])
        .setPopup(popup)
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
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), 'top-right');

    map.on('load', renderMarkers);
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

  :global(.popup-content) {
    font-family: inherit;
    font-size: 13px;
    line-height: 1.5;
  }

  :global(.popup-content strong) {
    display: block;
    font-size: 14px;
    margin-bottom: 4px;
  }

  :global(.popup-content p) {
    margin: 6px 0 4px;
    color: #444;
  }

  :global(.popup-content small) {
    color: #777;
  }

  :global(.popup-tag) {
    display: inline-block;
    padding: 1px 7px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    background: #e8e8e8;
    color: #333;
    margin-right: 4px;
  }

  :global(.popup-tag--sub) {
    background: #d4edda;
    color: #1a5c2a;
  }

  :global(.popup-tag--seasonal) {
    background: #fff3cd;
    color: #7a5800;
  }
</style>
