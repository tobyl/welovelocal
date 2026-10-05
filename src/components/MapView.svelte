<script>
  import { onMount, onDestroy } from 'svelte';
  import maplibregl from 'maplibre-gl';
  import 'maplibre-gl/dist/maplibre-gl.css';

  export let providers = [];
  export let activeCategories = new Set();
  export let sidebarOpen = true;
  export let selectedProvider = null;
  export let onselect = () => {};
  export let onselectgroup = () => {};
  export let ondeselect = () => {};

  let mapContainer;
  let map;
  let mapLoaded = false;
  let lastCenteredId = null;

  $: if (map && selectedProvider && selectedProvider.id !== lastCenteredId) {
    lastCenteredId = selectedProvider.id;
    const isDesktop = typeof window !== 'undefined' && window.innerWidth > 600;
    const offset = isDesktop ? [-60, 0] : [0, -100];
    map.easeTo({
      center: [selectedProvider.lng, selectedProvider.lat],
      zoom: Math.max(map.getZoom(), 13),
      offset,
      duration: 500
    });
  }

  const BRAND_COLOR = '#dc2d05';

  const CATEGORIES = {
    'produce':   { icon: 'produce' },
    'drinks':    { icon: 'wine' },
    'orchard':   { icon: 'apple' },
    'honey':     { icon: 'honey' },
    'meat-fish': { icon: 'fish' },
    'market':    { icon: 'farmers-market' },
  };

  // Fetch an SVG icon, colorise it, refine stroke width, rasterize at high resolution, and return HTMLImageElement.
  function loadSvgIcon(iconName, color, strokeWidth = 1.65) {
    return fetch(`/icons/${iconName}.svg`)
      .then(r => r.text())
      .then(svg => {
        let colored = svg
          .replace(/stroke="currentColor"/g, `stroke="${color}"`)
          .replace(/stroke-width="2"/g, `stroke-width="${strokeWidth}"`)
          .replace(/width="24"/, 'width="84"')
          .replace(/height="24"/, 'height="84"');
        return new Promise(resolve => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(colored);
        });
      });
  }

  // Draw a map-pin shape to high-DPI canvas (2x Retina supersampling)
  function createPinImage(color, iconImg) {
    const dpr = 2; // 2x Retina supersampling
    const w = 52, h = 66;
    const canvas = document.createElement('canvas');
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    const cx = w / 2;   // 26
    const r  = 21;      // outer circle radius
    const tipY = h - 4; // 62
    const cy   = Math.round(tipY - r * Math.SQRT2); // ≈ 32

    const aLeft  = Math.PI * 3 / 4; // 135°
    const aRight = Math.PI / 4;     // 45°

    // Subtle drop shadow for the pin
    ctx.shadowColor = 'rgba(0, 0, 0, 0.22)';
    ctx.shadowBlur = 3;
    ctx.shadowOffsetY = 1.5;

    // Outer pin body
    ctx.beginPath();
    ctx.arc(cx, cy, r, aLeft, aRight, false);
    ctx.lineTo(cx, tipY);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();

    // Turn off shadow for inner elements
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Inner white circle
    const innerR = 15.5;
    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    // High-res SVG icon centred in white circle
    const iconSize = 21;
    ctx.drawImage(iconImg, cx - iconSize / 2, cy - iconSize / 2, iconSize, iconSize);

    const imageData = ctx.getImageData(0, 0, w * dpr, h * dpr);
    return { width: w * dpr, height: h * dpr, data: imageData.data };
  }

  function buildGeoJSON() {
    const features = providers
      .filter(p => activeCategories.has(p.category))
      .map(p => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
        properties: {
          id: p.id,
          name: p.name,
          category: p.category,
          address: p.address,
          description: p.description,
          seasonal: p.seasonal,
          website: p.website,
          lat: p.lat,
          lng: p.lng,
          icon: `pin-${p.category}`,
        }
      }));
    return { type: 'FeatureCollection', features };
  }

  function updateSource() {
    const source = map?.getSource('providers');
    if (source) source.setData(buildGeoJSON());
  }

  $: if (mapLoaded && providers && activeCategories) updateSource();

  onMount(() => {
    map = new maplibregl.Map({
      container: mapContainer,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [-82.9, 42.15],
      zoom: 9.5,
      attributionControl: false,
    });
    if (typeof window !== 'undefined') window.__map = map;

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');
    map.addControl(new maplibregl.NavigationControl(), 'bottom-right');
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), 'bottom-right');

    map.on('load', async () => {

      // Load and colorise all category icons, then register pin images
      const iconImages = {};
      await Promise.all(
        Object.entries(CATEGORIES).map(async ([cat, { icon }]) => {
          iconImages[cat] = await loadSvgIcon(icon, BRAND_COLOR);
        })
      );
      for (const cat of Object.keys(CATEGORIES)) {
        map.addImage(`pin-${cat}`, createPinImage(BRAND_COLOR, iconImages[cat]), { pixelRatio: 2 });
      }

      // GeoJSON source with built-in clustering
      map.addSource('providers', {
        type: 'geojson',
        data: buildGeoJSON(),
        cluster: true,
        clusterMaxZoom: 13,
        clusterRadius: 50,
      });

      // ── Cluster circles ──
      map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'providers',
        filter: ['has', 'point_count'],
        paint: {
          'circle-color': '#fff',
          'circle-radius': ['step', ['get', 'point_count'], 18, 5, 23, 15, 29],
          'circle-stroke-width': 2.5,
          'circle-stroke-color': BRAND_COLOR,
        }
      });

      // ── Cluster count label ──
      map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'providers',
        filter: ['has', 'point_count'],
        layout: {
          'text-field': '{point_count_abbreviated}',
          'text-size': 13,
          'text-font': ['Noto Sans Bold'],
        },
        paint: { 'text-color': BRAND_COLOR }
      });

      // ── Individual pins ──
      map.addLayer({
        id: 'unclustered-point',
        type: 'symbol',
        source: 'providers',
        filter: ['!', ['has', 'point_count']],
        layout: {
          'icon-image': ['get', 'icon'],
          'icon-size': 1,
          'icon-anchor': 'bottom',
          'icon-allow-overlap': true,
        }
      });

      // Click cluster → smart fitBounds or open cluster group list
      let handlingClusterClick = false;
      async function handleClusterClick(e) {
        clickedFeature = true;
        if (handlingClusterClick) return;
        handlingClusterClick = true;
        setTimeout(() => { handlingClusterClick = false; }, 300);

        const features = (e.features && e.features.length)
          ? e.features
          : map.queryRenderedFeatures(e.point, { layers: ['clusters', 'cluster-count'] });
        const clusterFeature = features.find(f => f.properties && (f.properties.cluster || f.properties.point_count));
        if (!clusterFeature) return;

        const clusterId = clusterFeature.properties.cluster_id;
        const source = map.getSource('providers');
        if (!source) return;

        try {
          const leaves = await source.getClusterLeaves(clusterId, 100, 0);
          if (!leaves || !leaves.length) return;

          // Map leaf features to full provider objects
          const leafProviders = leaves.map(leaf => {
            const p = leaf.properties;
            const full = providers.find(item => item.id === p.id);
            if (full) return full;
            return {
              id: p.id,
              name: p.name,
              category: p.category,
              address: p.address,
              description: p.description,
              seasonal: p.seasonal === true || p.seasonal === 'true',
              website: (!p.website || p.website === 'null') ? null : p.website,
              lat: p.lat ?? leaf.geometry.coordinates[1],
              lng: p.lng ?? leaf.geometry.coordinates[0],
            };
          });

          // Calculate bounding box of leaves
          let minLng = Infinity, maxLng = -Infinity, minLat = Infinity, maxLat = -Infinity;
          for (const l of leaves) {
            const [lng, lat] = l.geometry.coordinates;
            if (lng < minLng) minLng = lng;
            if (lng > maxLng) maxLng = lng;
            if (lat < minLat) minLat = lat;
            if (lat > maxLat) maxLat = lat;
          }

          const currentZoom = map.getZoom();
          const dLng = maxLng - minLng;
          const dLat = maxLat - minLat;
          const isCoLocated = dLng < 0.0005 && dLat < 0.0005;
          const isSmallSpan = dLng < 0.02 && dLat < 0.02;

          const isDesktop = typeof window !== 'undefined' && window.innerWidth > 600;
          const padding = isDesktop
            ? { top: 80, bottom: 80, left: sidebarOpen ? 300 : 80, right: 80 }
            : { top: 70, bottom: 220, left: 40, right: 40 };

          // 1. If co-located / identical coordinates (e.g. multiple vendors at one address)
          if (isCoLocated) {
            map.easeTo({
              center: [minLng, minLat],
              zoom: Math.max(currentZoom, 13.5),
              duration: 500
            });
            onselectgroup({
              title: `${leafProviders.length} locations at this site`,
              providers: leafProviders,
            });
            return;
          }

          // 2. Small cluster (<= 6 locations), or zoomed in (zoom >= 11), or small geographic span
          if (leafProviders.length <= 6 || currentZoom >= 11 || isSmallSpan) {
            map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
              padding,
              maxZoom: 14,
              duration: 800
            });
            onselectgroup({
              title: `${leafProviders.length} locations in this area`,
              providers: leafProviders,
            });
          } else {
            // 3. Wide regional grouping when zoomed out: zoom in to frame the cluster's boundary
            map.fitBounds([[minLng, minLat], [maxLng, maxLat]], {
              padding,
              maxZoom: 13,
              duration: 800
            });
          }
        } catch (err) {
          console.error('Error getting cluster leaves:', err);
        }
      }

      map.on('click', 'clusters', handleClusterClick);
      map.on('click', 'cluster-count', handleClusterClick);

      // Click individual pin → select provider
      let clickedFeature = false;
      map.on('click', 'unclustered-point', (e) => {
        clickedFeature = true;
        const p = e.features[0].properties;
        const full = providers.find(item => item.id === p.id);
        const selected = full || {
          id: p.id,
          name: p.name,
          category: p.category,
          address: p.address,
          description: p.description,
          seasonal: p.seasonal === 'true' || p.seasonal === true,
          website: (!p.website || p.website === 'null') ? null : p.website,
          lat: p.lat,
          lng: p.lng,
        };
        lastCenteredId = selected.id;
        onselect(selected);
      });

      // Click map background → deselect
      map.on('click', () => {
        if (clickedFeature) { clickedFeature = false; return; }
        ondeselect();
      });

      // Pointer cursor on hover
      for (const layer of ['clusters', 'cluster-count', 'unclustered-point']) {
        map.on('mouseenter', layer, () => map.getCanvas().style.cursor = 'pointer');
        map.on('mouseleave', layer, () => map.getCanvas().style.cursor = '');
      }

      mapLoaded = true;
    });
  });

  onDestroy(() => map?.remove());
</script>

<div bind:this={mapContainer} class="map-container"></div>

<style>
  .map-container {
    width: 100%;
    height: 100%;
  }
</style>
