<script>
  import UIButton from './ui.button.svelte';
  export let values = [];
</script>

<div class="buttons has-addons">
  {#each values as item (item) }
  <UIButton {...item} />
  {/each}
</div>
