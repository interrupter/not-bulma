<script>
    import UIImage from "./ui.image.svelte";
    let { values = [] } = $props();
</script>

{#each values as item (item.url)}
    <UIImage {...item} on:click />
{/each}
