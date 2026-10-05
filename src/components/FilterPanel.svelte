<script>
  export let activeCategories;
  export let sidebarOpen = true;

  const FILTERS = [
    {
      category: 'produce',
      label: 'Produce & Stands',
      icon: 'produce',
      color: '#2d7a2d',
    },
    {
      category: 'drinks',
      label: 'Wineries & Craft Drinks',
      icon: 'wine',
      color: '#7b2d56',
    },
    {
      category: 'orchard',
      label: 'Orchards & Berries',
      icon: 'apple',
      color: '#c0392b',
    },
    {
      category: 'honey',
      label: 'Honey & Apiaries',
      icon: 'honey',
      color: '#d9822b',
    },
    {
      category: 'meat-fish',
      label: 'Meats, Fish & Specialty',
      icon: 'fish',
      color: '#a0522d',
    },
    {
      category: 'market',
      label: "Farmers' Markets",
      icon: 'farmers-market',
      color: '#6a329f',
    },
  ];

  let mobileOpen = false;
  let modalOpen = false;

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
    <img src="/masthead.svg" alt="Windsor-Essex ♥ Local" class="masthead-img" />
  </div>

  <!-- Mobile header bar -->
  <div class="mobile-bar mobile-only">
    <img src="/masthead.svg" alt="Windsor-Essex ♥ Local" class="masthead-img" />
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
    {#each FILTERS as filter}
      <button
        class="filter-btn"
        class:active={activeCategories.has(filter.category)}
        style="--accent: {filter.color}"
        on:click={() => toggle(filter.category)}
        aria-pressed={activeCategories.has(filter.category)}
      >
        <span class="filter-icon" style="--icon: url('/icons/{filter.icon}.svg')"></span>
        <span class="filter-label">{filter.label}</span>
        <span class="filter-check" class:on={activeCategories.has(filter.category)}></span>
      </button>
    {/each}
  </nav>

  <!-- Desktop footer only -->
  <footer class="panel-footer desktop-only">
    <button class="info-btn" on:click={() => modalOpen = true}>What's included?</button>
    <p>Data updated manually.<br/>Know a spot? <a href="mailto:hello@welovelocal.ca">Get in touch</a>.</p>
  </footer>

</aside>

{#if modalOpen}
  <!-- svelte-ignore a11y-click-events-have-key-events a11y-no-static-element-interactions -->
  <div class="modal-backdrop" on:click={() => modalOpen = false}>
    <div class="modal" on:click|stopPropagation>
      <button class="modal-close" on:click={() => modalOpen = false} aria-label="Close">✕</button>
      <h3>What's included?</h3>
      <p>This map shows the locations of small stores, roadside stands, farms and other outlets that sell locally grown produce, meats and other fare.</p>
      <p>What's included:</p>
      <ul>
        <li>Produce & roadside farm stands</li>
        <li>Wineries, cideries & craft breweries</li>
        <li>Orchards, berry patches & cider mills</li>
        <li>Honey farms & local apiaries</li>
        <li>Meats, Lake Erie fish & specialty foods</li>
        <li>Community farmers' markets</li>
      </ul>
    </div>
  </div>
{/if}

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
    background: linear-gradient(to bottom, #f5eedf 85%, #e8d9bc);
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
    padding: 4px 0;
  }

  .masthead-img {
    display: block;
    width: 100%;
    height: auto;
  }

  .filters {
    display: flex;
    flex-direction: column;
    border: 1px solid #e8e8e8;
    border-radius: 10px;
    overflow: hidden;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  }

  .filter-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    border: none;
    border-bottom: 1.5px solid #e8e8e8;
    border-radius: 0;
    background: transparent;
    cursor: pointer;
    font-size: 14px;
    font-family: inherit;
    color: #aaa;
    transition: color 0.15s ease, background 0.15s ease;
  }

  .filter-btn:last-child {
    border-bottom: none;
  }

  .filter-btn:hover {
    background: rgba(0,0,0,0.03);
    color: var(--accent);
  }

  .filter-btn.active {
    color: var(--accent);
  }

  .filter-icon {
    display: block;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    background-color: #ccc;
    -webkit-mask-image: var(--icon);
    -webkit-mask-size: contain;
    -webkit-mask-repeat: no-repeat;
    -webkit-mask-position: center;
    mask-image: var(--icon);
    mask-size: contain;
    mask-repeat: no-repeat;
    mask-position: center;
    transition: background-color 0.15s ease;
  }

  .filter-btn:hover .filter-icon,
  .filter-btn.active .filter-icon {
    background-color: var(--accent);
  }

  .filter-label {
    flex: 1;
    text-align: left;
    font-weight: 500;
    line-height: 1.25;
  }

  .filter-check {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    border: 1.5px solid #ddd;
    flex-shrink: 0;
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  .filter-check.on {
    background: var(--accent);
    border-color: var(--accent);
  }

  .panel-footer {
    margin-top: auto;
    font-size: 12px;
    color: #aaa;
    line-height: 1.5;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .info-btn {
    align-self: flex-start;
    background: none;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 5px 10px;
    font-size: 12px;
    font-family: inherit;
    color: #888;
    cursor: pointer;
    transition: border-color 0.15s, color 0.15s;
  }

  .info-btn:hover {
    border-color: #888;
    color: #444;
  }

  :global(.modal-backdrop) {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    z-index: 200;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }

  :global(.modal) {
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    padding: 28px;
    max-width: 400px;
    width: 100%;
    position: relative;
    font-size: 14px;
    line-height: 1.6;
    color: #444;
  }

  :global(.modal h3) {
    margin: 0 0 14px;
    font-size: 17px;
    font-weight: 700;
    color: #1a1a1a;
    padding-right: 24px;
  }

  :global(.modal p) {
    margin: 0 0 10px;
  }

  :global(.modal ul) {
    margin: 0;
    padding-left: 20px;
  }

  :global(.modal ul li) {
    margin-bottom: 4px;
  }

  :global(.modal-close) {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 28px;
    height: 28px;
    border: none;
    background: #f0f0f0;
    border-radius: 50%;
    cursor: pointer;
    font-size: 12px;
    color: #666;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
  }

  :global(.modal-close:hover) {
    background: #e0e0e0;
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
      background: #f5eedf;
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

    .mobile-bar .masthead-img {
      height: 32px;
      width: auto;
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
