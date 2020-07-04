<script>
  import UILink from './ui.link.svelte';
  export let values = [];
</script>

<div class="field has-addons">
  <p class="control">
    {#each values as item (item) }
    <UILink {...item} />
    {/each}
  </p>
</div>
