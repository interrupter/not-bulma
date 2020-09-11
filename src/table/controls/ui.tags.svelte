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
<span class="mx-1 tag is-{item.type}">{item.title}</span>
{/each}
