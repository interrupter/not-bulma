<script>
  export let values = [];
</script>

{#each values as item (item.url) }
<figure class="image is-64x64">
  <img class="is-rounded" alt="{item.title}" src="{item.url}"  crossOrigin="{item.cors}" />
</figure>
{/each}
