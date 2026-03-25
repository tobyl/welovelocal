<script>
  import MapView from './components/MapView.svelte';
  import FilterPanel from './components/FilterPanel.svelte';
  import providers from './data/providers.json';

  let activeCategories = new Set(['farm', 'roadside-stand', 'market']);
</script>

<div class="app">
  <FilterPanel bind:activeCategories />
  <MapView {providers} {activeCategories} />
</div>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow: hidden;
  }

  .app {
    display: flex;
    width: 100vw;
    height: 100vh;
  }
</style>
