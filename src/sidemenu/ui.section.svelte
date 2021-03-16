<script>
  import UIIndicator from '../ui.indicator.svelte';
  import UISideMenuItems from './ui.items.svelte';

  export let section;
  export let items = [];
  export let root = '';

  $: sectionItems = items.filter(item => section.id === item.section );
</script>

{#if section}
<p class="menu-label">
  {section.title}
  {#if section.tag }
    <UIIndicator id={section.id} {...section.tag} />
  {/if}
  {#if section.indicator }
    <UIIndicator id={section.id} {...section.indicator } />
  {/if}
</p>
{/if}
{#if sectionItems.length }
<UISideMenuItems {root} items={sectionItems} on:navigate />
{/if}
