<script>
  export let activeCategories;

  const FILTERS = [
    {
      category: 'farm',
      label: 'Farms',
      icon: '🌾',
      color: '#2d7a2d',
      subcategories: ['fruit-veg', 'meat', 'poultry'],
    },
    {
      category: 'roadside-stand',
      label: 'Roadside Stands',
      icon: '🥕',
      color: '#e07b00',
      subcategories: ['fruit-veg'],
    },
    {
      category: 'market',
      label: "Farmers' Markets",
      icon: '🏪',
      color: '#7b3fa0',
      subcategories: ['mixed'],
    },
  ];

  function toggle(category) {
    const next = new Set(activeCategories);
    if (next.has(category)) {
      next.delete(category);
    } else {
      next.add(category);
    }
    activeCategories = next;
  }
</script>

<aside class="filter-panel">
  <div class="panel-header">
    <span class="panel-logo">🍅</span>
    <div>
      <h1>Love Local</h1>
      <p>Windsor-Essex</p>
    </div>
  </div>

  <nav class="filters">
    <h2>Show on map</h2>
    {#each FILTERS as filter}
      <button
        class="filter-btn"
        class:active={activeCategories.has(filter.category)}
        style="--accent: {filter.color}"
        on:click={() => toggle(filter.category)}
        aria-pressed={activeCategories.has(filter.category)}
      >
        <span class="filter-icon">{filter.icon}</span>
        <span class="filter-label">{filter.label}</span>
        <span class="filter-check">{activeCategories.has(filter.category) ? '✓' : ''}</span>
      </button>
    {/each}
  </nav>

  <footer class="panel-footer">
    <p>Data updated manually.<br/>Know a spot? <a href="mailto:hello@lovelocal.ca">Get in touch</a>.</p>
  </footer>
</aside>

<style>
  .filter-panel {
    display: flex;
    flex-direction: column;
    width: 240px;
    min-width: 240px;
    height: 100%;
    background: #fff;
    box-shadow: 2px 0 12px rgba(0,0,0,0.1);
    z-index: 10;
    padding: 20px 16px;
    box-sizing: border-box;
    gap: 24px;
  }

  .panel-header {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .panel-logo {
    font-size: 32px;
    line-height: 1;
  }

  h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.2;
  }

  .panel-header p {
    margin: 0;
    font-size: 12px;
    color: #888;
    font-weight: 500;
    letter-spacing: 0.03em;
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  h2 {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #aaa;
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: 2px solid #e8e8e8;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    color: #555;
    transition: all 0.15s ease;
  }

  .filter-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .filter-btn.active {
    background: var(--accent);
    border-color: var(--accent);
    color: #fff;
  }

  .filter-icon {
    font-size: 18px;
    line-height: 1;
  }

  .filter-label {
    flex: 1;
    text-align: left;
    font-weight: 500;
  }

  .filter-check {
    font-size: 13px;
    font-weight: 700;
    width: 16px;
    text-align: center;
  }

  .panel-footer {
    margin-top: auto;
    font-size: 12px;
    color: #aaa;
    line-height: 1.5;
  }

  .panel-footer a {
    color: #2d7a2d;
  }
</style>
