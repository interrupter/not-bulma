<script>
  import UIIndicator from './ui.indicator.svelte';
  import UISideMenuItems from './ui.side.menu.items.svelte';

  export let section;
  export let items = [];
  export let root = '';

  $: sectionItems = items.filter(item => section.id === item.section );
</script>

{#if section}
<p class="menu-label">
  {section.title}
  {#if section.tag }
  <span class="ml-3 tag is-{section.tag.type} is-pulled-right">{section.tag.label}</span>
  {/if}
  {#if section.indicator }
    <UIIndicator {...(section.indicator)} />
  {/if}
</p>
{/if}
{#if sectionItems.length }
<UISideMenuItems {root} items={sectionItems} on:navigate />
{/if}
