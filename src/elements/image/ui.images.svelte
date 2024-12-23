<script>
    import UIImage from "./ui.image.svelte";

    let { values = [], ...override } = $props();
</script>

{#each values as item (item.url)}
    <UIImage {...item} {...override} />
{/each}
