<script>
  export let provider = null;
  export let onclose = () => {};

  $: directionsUrl = provider
    ? `https://www.google.com/maps/dir/?api=1&destination=${provider.lat},${provider.lng}`
    : '#';
</script>

{#if provider}
  <div class="detail-panel">
    <button class="close-btn" on:click={onclose} aria-label="Close">✕</button>

    <div class="detail-header">
      <h2>{provider.name}</h2>
      <div class="tags">
        <span class="tag">{provider.category.replace('-', ' ')}</span>
        {#if provider.subcategory !== 'mixed'}
          <span class="tag tag--sub">{provider.subcategory}</span>
        {/if}
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

    <a class="directions-btn" href={directionsUrl} target="_blank" rel="noopener noreferrer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      Get directions
    </a>
  </div>
{/if}

<style>
  .detail-panel {
    position: fixed;
    background: #fff;
    border-radius: 14px;
    box-shadow: 0 4px 24px rgba(0,0,0,0.13);
    padding: 20px;
    z-index: 100;

    /* Desktop: top right */
    right: 16px;
    top: 16px;
    width: 280px;
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
  }

  .close-btn:hover {
    background: #e0e0e0;
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

  .tag--sub {
    background: #d4edda;
    color: #1a5c2a;
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

  .directions-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    padding: 10px;
    background: #1a73e8;
    color: #fff;
    border-radius: 8px;
    text-decoration: none;
    font-size: 14px;
    font-weight: 600;
    transition: background 0.15s ease;
  }

  .directions-btn:hover {
    background: #1557b0;
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
      border-radius: 14px 14px 0 0;
      padding: 20px 20px 32px;
    }
  }
</style>
