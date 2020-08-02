<script>
  import UISideMenuItems from './ui.side.menu.items.svelte';

  export let section;
  export let items = [];
  export let root = '';

  $: sectionItems = items.filter(item => section.id === item.section );
</script>

{#if section}
<p class="menu-label">{section.title}</p>
{/if}
{#if sectionItems.length }
<UISideMenuItems {root} items={sectionItems} on:navigate />
{/if}
