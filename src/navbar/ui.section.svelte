<script>
  import {
    createEventDispatcher
  } from 'svelte';
  const dispatch = createEventDispatcher();

  import UIItemContent from './ui.item.content.svelte';
  import UIItem from './ui.item.svelte';
  export let root = '';
  export let section = {};
  export let items = [];

  export let hidden = '';
  export let hoverable = true;
  export let arrowless = false;
  export let right = false;

  function onClick(event){
    dispatch('click', {event, element: section});
  }
</script>

{#if items.length }
<div class="navbar-item has-dropdown {hoverable?'is-hoverable':''} {hidden?`is-hidden-${hidden}`:''} ">
  <a
    href
    on:click={onClick}
    class="navbar-link {arrowless?'is-arrowless':''}"
    >
    <UIItemContent item={section} />
  </a>
  <div class="navbar-dropdown {right?'is-right':''}">
    {#each items as item(item.id)}
    <UIItem {root} {item} on:click />
    {/each}
  </div>
</div>
{:else}
{#if section.url }
<a class="navbar-item {hidden?`is-hidden-${hidden}`:''} "
  href="{root}{section.url}"
  data-href="{section.url}"
  on:click={onClick}
  >
  <UIItemContent item={section} />
</a>
{:else}
<div
  class="navbar-item {hidden?`is-hidden-${hidden}`:''} "
  on:click={onClick}
  >
  <UIItemContent item={section} />
</div>
{/if}
{/if}
