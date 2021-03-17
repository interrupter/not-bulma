<script>
  import UIItemContent from './ui.item.content.svelte';
  import UIItem from './ui.item.svelte';
  export let root = '';
  export let section = {};
  export let items = [];
  export let hidden = '';
  export let hoverable = true;
  export let arrowless = false;

  export let onClick = ()=>{};
</script>

{#if items.length }
<div class="navbar-item has-dropdown {hoverable?'is-hoverable':''} {hidden?`is-hidden-${hidden}`:''} ">
  <a href class="navbar-link {arrowless?'is-arrowless':''}" on:click="{(e)=>{onClick(e, section);}}">
    <UIItemContent item={section} />
  </a>
  <div class="navbar-dropdown {section.right?'is-right':''}">
    {#each items as item(item.id)}
    <UIItem {root} {item}  />
    {/each}
  </div>
</div>
{:else}
{#if section.url }
<a class="navbar-item {hidden?`is-hidden-${hidden}`:''} " href="{root}{section.url}">
  <UIItemContent item={section} />
</a>
{:else}
<div class="navbar-item {hidden?`is-hidden-${hidden}`:''} ">
  <UIItemContent item={section} />
</div>
{/if}
{/if}
