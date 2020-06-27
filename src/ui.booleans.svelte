<script>
  export let YES = 'Да';
  export let NO = 'Нет';
  export let values = [];
</script>

{#each values as item }
{#if item.value }
<span class="tag is-success">{YES}</span>
{:else}
<span class="tag is-danger">{NO}</span>
{/if}
{/each}
