<script>

  import { createEventDispatcher } from 'svelte';
  let dispatch = createEventDispatcher();

  /*
  item = {
    id,        //unique
    title,     //some text
    type       //for coloring items, usual html template names danger, success, etc
  }
  */

  export let values = [];

</script>

{#each values as item (item.id)}
{#if item.value }
  <div class="mx-1 tags has-addons">
    <span class="tag">{item.title}</span>
    <span class="tag is-{item.color}">{item.value}</span>
  </div>
{:else}
  <span class="mx-1 tag is-{item.color}">{item.title}</span>
{/if}
{/each}
