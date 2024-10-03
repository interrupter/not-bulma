<script>
    import { onMount } from "svelte";
    import UIBoolean from "./ui.boolean.svelte";

    export let values = [];
    export let inverted = false;
    export let componentConstructor = UIBoolean;

    let _values = [];

    onMount(() => {
        if (typeof values === "boolean") {
            _values = [values];
        } else if (Array.isArray(values)) {
            _values = [...values];
        }
    });
</script>

{#each _values as item}
    <svelte:component
        this={componentConstructor}
        {...item}
        inverted={inverted || item.inverted}
    />
{/each}
