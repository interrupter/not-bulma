<script>
    import UIBoolean from "./ui.boolean.svelte";

    export let values = [];
    export let inverted = false;
    export let componentContructor = UIBoolean;
</script>

{#each values as item}
    <svelte:component
        this={componentContructor}
        {...item}
        inverted={inverted || item.inverted}
    />
{/each}
