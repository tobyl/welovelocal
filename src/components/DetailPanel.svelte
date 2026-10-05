<script>
  export let provider = null;
  export let group = null;
  export let onclose = () => {};
  export let onselectprovider = () => {};
  export let onbacktogroup = () => {};

  const CATEGORY_COLORS = {
    'produce': '#2d7a2d',
    'drinks': '#7b2d56',
    'orchard': '#c0392b',
    'honey': '#d9822b',
    'meat-fish': '#a0522d',
    'market': '#6a329f',
  };

  const CATEGORY_LABELS = {
    'produce': 'Produce & Stand',
    'drinks': 'Winery & Drinks',
    'orchard': 'Orchard & Berries',
    'honey': 'Honey & Apiary',
    'meat-fish': 'Meat, Fish & Specialty',
    'market': "Farmers' Market",
  };

  $: directionsUrl = provider
    ? `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`
    : '#';
</script>

{#if group && !provider}
  <div class="detail-panel group-panel">
    <button class="close-btn" on:click={onclose} aria-label="Close">✕</button>

    <div class="panel-top-bar">
      <div class="group-title">
        <span class="group-count-badge">{group.providers.length}</span>
        <h3>{group.title || 'Locations in this area'}</h3>
      </div>
    </div>

    <div class="group-list">
      {#each group.providers as item (item.id)}
        <button class="group-item-card" on:click={() => onselectprovider(item)}>
          <div class="item-category-bar" style="background: {CATEGORY_COLORS[item.category] || '#666'}"></div>
          <div class="item-content">
            <div class="item-name">{item.name}</div>
            <div class="tags">
              <span class="tag">{CATEGORY_LABELS[item.category] || item.category}</span>
              {#if item.seasonal}
                <span class="tag tag--seasonal">Seasonal</span>
              {/if}
            </div>
            <div class="item-address">{item.address}</div>
          </div>
          <div class="item-arrow">›</div>
        </button>
      {/each}
    </div>
  </div>
{:else if provider}
  <div class="detail-panel">
    <button class="close-btn" on:click={onclose} aria-label="Close">✕</button>

    {#if group}
      <div class="panel-top-bar">
        <button class="back-btn" on:click={onbacktogroup}>
          ‹ All {group.providers.length} locations
        </button>
      </div>
    {/if}

    <div class="detail-header">
      <h2>{provider.name}</h2>
      <div class="tags">
        <span class="tag">{CATEGORY_LABELS[provider.category] || provider.category.replace('-', ' ')}</span>
        {#if provider.seasonal}
          <span class="tag tag--seasonal">Seasonal</span>
        {/if}
      </div>
    </div>

    <p class="description">{provider.description}</p>

    <div class="address">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
      {provider.address}
    </div>

    <div class="actions">
      <a class="directions-btn" href={directionsUrl} target="_blank" rel="noopener noreferrer">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
        Get directions
      </a>
      {#if provider.website}
        <a class="website-btn" href={provider.website} target="_blank" rel="noopener noreferrer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
          Visit website
        </a>
      {/if}
    </div>
  </div>
{/if}

<style>
  .detail-panel {
    position: fixed;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.13);
    padding: 18px;
    z-index: 100;
    right: 16px;
    top: 16px;
    width: 310px;
    max-height: calc(100vh - 32px);
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
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
    line-height: 1;
    padding: 0;
    z-index: 10;
  }

  .close-btn:hover {
    background: #e0e0e0;
  }

  .panel-top-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding-right: 32px;
    min-height: 26px;
  }

  .group-title {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .group-title h3 {
    margin: 0;
    font-size: 15px;
    font-weight: 700;
    color: #1a1a1a;
  }

  .group-count-badge {
    background: #8b5e3c;
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: 10px;
    line-height: 1.2;
  }

  .back-btn {
    background: none;
    border: none;
    color: #1a73e8;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    padding: 2px 0;
    display: flex;
    align-items: center;
    gap: 4px;
    font-family: inherit;
  }

  .back-btn:hover {
    text-decoration: underline;
  }

  .group-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow-y: auto;
    padding-right: 2px;
    margin-top: 4px;
    max-height: calc(100vh - 110px);
  }

  .group-item-card {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    background: #fdfdfd;
    border: 1px solid #eaeaea;
    border-radius: 10px;
    cursor: pointer;
    text-align: left;
    font-family: inherit;
    transition: background 0.15s ease, border-color 0.15s ease, transform 0.1s ease;
    position: relative;
    overflow: hidden;
  }

  .group-item-card:hover {
    background: #f7f5f2;
    border-color: #d8d8d8;
    transform: translateY(-1px);
  }

  .item-category-bar {
    width: 4px;
    align-self: stretch;
    border-radius: 4px;
    flex-shrink: 0;
  }

  .item-content {
    flex: 1;
    min-width: 0;
  }

  .item-name {
    font-size: 13px;
    font-weight: 600;
    color: #1a1a1a;
    margin-bottom: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-address {
    font-size: 11px;
    color: #888;
    margin-top: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .item-arrow {
    color: #bbb;
    font-size: 16px;
    font-weight: 300;
    flex-shrink: 0;
  }

  .detail-header {
    padding-right: 24px;
    margin-bottom: 10px;
  }

  h2 {
    margin: 0 0 6px;
    font-size: 16px;
    font-weight: 700;
    color: #1a1a1a;
    line-height: 1.3;
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 11px;
    font-weight: 600;
    text-transform: capitalize;
    background: #e8e8e8;
    color: #333;
  }

  .tag--seasonal {
    background: #fff3cd;
    color: #7a5800;
  }

  .description {
    font-size: 13px;
    color: #555;
    line-height: 1.5;
    margin: 0 0 12px;
    overflow-y: auto;
    max-height: 140px;
  }

  .address {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 12px;
    color: #888;
    margin-bottom: 16px;
    line-height: 1.4;
  }

  .address svg {
    flex-shrink: 0;
    margin-top: 1px;
    color: #aaa;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .directions-btn, .website-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.15s ease;
  }

  .directions-btn {
    background: #1a73e8;
    color: #fff;
  }

  .directions-btn:hover {
    background: #1557b0;
  }

  .website-btn {
    background: #f0f0f0;
    color: #333;
  }

  .website-btn:hover {
    background: #e4e4e4;
  }

  /* Mobile: bottom sheet */
  @media (max-width: 600px) {
    .detail-panel {
      right: 0;
      left: 0;
      bottom: 0;
      top: auto;
      transform: none;
      width: 100%;
      border-radius: 16px 16px 0 0;
      padding: 16px 16px 28px;
      max-height: 60vh;
    }

    .group-list {
      max-height: 48vh;
    }
  }
</style>
