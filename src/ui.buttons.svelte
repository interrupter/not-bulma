<script>
  import UIButton from './ui.button.js';
  export let values = [];
</script>

<div class="buttons has-addons">
  {#each values as item (item) }
  <UIButton props={...item} />
  {/each}
</div>
