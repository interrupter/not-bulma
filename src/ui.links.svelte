<script>
  export let values = [];
</script>

<div class="field has-addons">
  <p class="control">
    {#each values as item (item.url) }
    {#if item.type === 'danger'}
    <a href="{item.url}" class="button is-link is-small is-light is-danger is-outlined">{item.title}</a>
    {:else }
    <a href="{item.url}" class="button is-link is-small is-light">{item.title}</a>
    {/if}
    {/each}
  </p>
</div>
