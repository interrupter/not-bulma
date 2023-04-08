<script>
    import UIImage from "./ui.image.svelte";
    export let values = [];
</script>

{#each values as item (item.url)}
    <UIImage {...item} on:click />
{/each}
