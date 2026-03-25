<script>
  export let activeCategories;
  export let sidebarOpen = true;
  export let ontoggle = () => {};

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

  let mobileOpen = false;

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

<aside class="filter-panel" class:collapsed={!sidebarOpen}>

  <!-- Desktop masthead -->
  <div class="panel-header desktop-only">
    <h1>Windsor-Essex<br><span class="heart">♥</span><br>Local</h1>
  </div>

  <!-- Mobile header bar -->
  <div class="mobile-bar mobile-only">
    <h1>Windsor-Essex <span class="heart">♥</span> Local</h1>
    <button
      class="filters-toggle"
      class:open={mobileOpen}
      on:click={() => mobileOpen = !mobileOpen}
      aria-expanded={mobileOpen}
    >
      <span class="hamburger-icon">
        <span></span><span></span><span></span>
      </span>
      Filters
    </button>
  </div>

  <!-- Filters: always visible on desktop, dropdown on mobile -->
  <nav class="filters" class:mobile-open={mobileOpen}>
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

  <!-- Desktop footer only -->
  <footer class="panel-footer desktop-only">
    <p>Data updated manually.<br/>Know a spot? <a href="mailto:hello@welovelocal.ca">Get in touch</a>.</p>
  </footer>

</aside>

<style>
  /* ── Desktop sidebar ── */
  .filter-panel {
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    display: flex;
    flex-direction: column;
    width: 240px;
    background: #fff;
    box-shadow: 2px 0 12px rgba(0,0,0,0.1);
    z-index: 10;
    padding: 20px 16px;
    box-sizing: border-box;
    gap: 24px;
    transition: transform 0.25s ease;
  }

  .filter-panel.collapsed {
    transform: translateX(-100%);
  }

  .panel-header {
    text-align: center;
  }

  h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.6;
  }

  .heart {
    display: inline-block;
    font-size: 36px;
    color: #c0392b;
    line-height: 1;
    animation: pulse 1.4s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.2); }
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

  /* ── Visibility helpers ── */
  .mobile-only { display: none; }

  /* ── Mobile layout ── */
  @media (max-width: 600px) {
    .filter-panel {
      position: relative;
      width: 100%;
      height: auto;
      bottom: auto;
      flex-direction: column;
      padding: 0;
      gap: 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.12);
      overflow: visible;
      transition: none;
      transform: none !important;
    }

    .desktop-only { display: none; }
    .mobile-only  { display: flex; }

    .mobile-bar {
      align-items: center;
      justify-content: space-between;
      padding: 10px 16px;
      gap: 12px;
    }

    .mobile-bar h1 {
      font-size: 16px;
      line-height: 1.2;
      white-space: nowrap;
    }

    .mobile-bar .heart {
      font-size: 18px;
      vertical-align: middle;
    }

    .filters-toggle {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      border: 2px solid #e8e8e8;
      border-radius: 8px;
      background: #fff;
      cursor: pointer;
      font-size: 13px;
      font-weight: 600;
      font-family: inherit;
      color: #555;
      white-space: nowrap;
      transition: all 0.15s ease;
    }

    .filters-toggle.open {
      background: #1a1a1a;
      border-color: #1a1a1a;
      color: #fff;
    }

    .hamburger-icon {
      display: flex;
      flex-direction: column;
      gap: 3px;
      width: 14px;
    }

    .hamburger-icon span {
      display: block;
      height: 2px;
      background: currentColor;
      border-radius: 2px;
    }

    /* Filters hidden by default on mobile */
    .filters {
      display: none;
      padding: 12px 16px 16px;
      background: #fff;
      border-top: 1px solid #f0f0f0;
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.12);
      z-index: 20;
    }

    .filters.mobile-open {
      display: flex;
    }
  }
</style>
