<script>
    import UIImage from "./ui.image.svelte";
    let { values = [], onclick = () => true } = $props();
</script>

{#each values as item (item.url)}
    <UIImage {...item} {onclick} />
{/each}
