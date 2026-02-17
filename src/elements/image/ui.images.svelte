<script>
    import UIImage from "./ui.image.svelte";
    let { values = [], onclick = () => {} } = $props();
</script>

{#each values as item (item.src)}
    <UIImage {...item} {onclick} />
{/each}
