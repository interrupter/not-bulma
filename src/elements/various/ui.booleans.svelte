<script>
    import UIBoolean from "./ui.boolean.svelte";

    export let values = [];
</script>

{#each values as item}
    <UIBoolean value={item.value} />
{/each}
