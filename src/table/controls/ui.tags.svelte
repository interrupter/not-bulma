<script>

  import { createEventDispatcher } from 'svelte';
  let dispatch = createEventDispatcher();

  /*
  item = {
    id,        //unique
    title,     //some text
    value,      //for double tags
    color       //coloring
  }
  */

  export let values = [];

</script>

{#each values as item (item.id)}
{#if Object.prototype.hasOwnProperty.call(item, 'value') }
  <div class="mx-1 tags has-addons">
    <span class="tag">{item.title}</span>
    <span class="tag is-{item.color}">
      {#if item.url }
      <a href="{item.url}">{item.value}</a>
      {:else}
      {item.value}
      {/if}
    </span>
  </div>
{:else}
  <span class="mx-1 tag is-{item.color}">
    {#if item.url }
    <a href="{item.url}">{item.title}</a>
    {:else}
    {item.title}
    {/if}
  </span>
{/if}
{/each}

<style>
  .tags:not(:last-child){
    margin-bottom: none;
  }
</style>
