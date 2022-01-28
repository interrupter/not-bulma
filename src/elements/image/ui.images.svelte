<script>
  export let values = [];
</script>

{#each values as item (item.url) }
{#if item.urlFull }
<a href="{item.urlFull}" alt="{item.title}" >
  <figure class="image is-64x64">
    <img class="" alt="{item.title}" src="{item.url}"  crossOrigin="{item.cors}" />
  </figure>
</a>
{:else}
<figure class="image is-64x64">
  <img class="" alt="{item.title}" src="{item.url}"  crossOrigin="{item.cors}" />
</figure>
{/if}
{/each}
