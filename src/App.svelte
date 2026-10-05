<script>
  import MapView from './components/MapView.svelte';
  import FilterPanel from './components/FilterPanel.svelte';
  import DetailPanel from './components/DetailPanel.svelte';
  import providers from './data/providers.json';

  let activeCategories = new Set(['drinks', 'produce', 'honey', 'meat-fish', 'orchard', 'market']);
  let selectedProvider = null;
  let selectedGroup = null;
  let sidebarOpen = true;

  function handleSelectProvider(p) {
    selectedProvider = p;
    selectedGroup = null;
  }

  function handleSelectGroup(grp) {
    selectedGroup = grp;
    selectedProvider = null;
  }

  function handleSelectProviderFromGroup(p) {
    selectedProvider = p;
  }

  function handleBackToGroup() {
    selectedProvider = null;
  }

  function handleClosePanel() {
    selectedProvider = null;
    selectedGroup = null;
  }
</script>

<div class="app">
  <!-- Sidebar overlays the map on desktop, sits on top on mobile -->
  <FilterPanel bind:activeCategories {sidebarOpen} />

  <!-- Map always fills the full viewport on desktop -->
  <div class="map-wrapper">
    <MapView
      {providers}
      {activeCategories}
      {sidebarOpen}
      {selectedProvider}
      onselect={handleSelectProvider}
      onselectgroup={handleSelectGroup}
      ondeselect={handleClosePanel}
    />
  </div>

  <!-- Collapse tab overlays the map at the sidebar edge -->
  <button
    class="sidebar-tab"
    class:closed={!sidebarOpen}
    on:click={() => sidebarOpen = !sidebarOpen}
    aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
  >{sidebarOpen ? '◀' : '▶'}</button>

  <DetailPanel
    provider={selectedProvider}
    group={selectedGroup}
    onclose={handleClosePanel}
    onselectprovider={handleSelectProviderFromGroup}
    onbacktogroup={handleBackToGroup}
  />
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
    position: relative;
    width: 100vw;
    height: 100vh;
  }

  /* Map always full screen */
  .map-wrapper {
    position: absolute;
    inset: 0;
  }

  /* Sidebar tab tracks the sidebar edge */
  .sidebar-tab {
    position: absolute;
    top: 50%;
    left: 240px;
    transform: translateY(-50%);
    width: 20px;
    height: 48px;
    background: #fff;
    border: none;
    border-radius: 0 8px 8px 0;
    box-shadow: 2px 0 8px rgba(0,0,0,0.1);
    cursor: pointer;
    font-size: 10px;
    color: #888;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 20;
    padding: 0;
    transition: left 0.25s ease;
  }

  .sidebar-tab:hover {
    color: #333;
    background: #f5f5f5;
  }

  .sidebar-tab.closed {
    left: 0;
  }

  @media (max-width: 600px) {
    .app {
      display: flex;
      flex-direction: column;
    }

    .map-wrapper {
      position: relative;
      flex: 1;
      inset: auto;
    }

    .sidebar-tab {
      display: none;
    }
  }
</style>
