<script>
    import UIBoolean from "./ui.boolean.svelte";

    export let values = [];
    export let inverted = false;
    export let componentConstructor = UIBoolean;
</script>

{#each values as item}
    <svelte:component
        this={componentConstructor}
        {...item}
        inverted={inverted || item.inverted}
    />
{/each}
