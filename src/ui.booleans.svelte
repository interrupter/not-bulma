<script>
  const  
  export let values = [];
</script>

{#each values as item }
{#if item.value }
<span class="tag is-success">{YES}</span>
{:else}
<span class="tag is-danger">{NO}</span>
{/if}
{/each}
