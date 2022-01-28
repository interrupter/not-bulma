<script>
  import UIButton from './ui.button.svelte';
  
  export let values = [];
  export let centered = false;
  export let right = false;
  export let classes = '';
</script>

<div class="buttons has-addons {centered?'is-centered':''} {right?'is-right':''} {classes}">
  {#each values as item (item) }
  <UIButton {...item} />
  {/each}
</div>
