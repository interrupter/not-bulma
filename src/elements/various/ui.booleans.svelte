<script>
    import { onMount } from "svelte";
    import UIBoolean from "./ui.boolean.svelte";

    export let values = [];
    export let inverted = false;
    export let componentConstructor = UIBoolean;

    let _values = [];

    onMount(() => {
        if (typeof values === "boolean") {
            _values = [{ value: values }];
        } else if (Array.isArray(values)) {
            if (values.every((itm) => typeof itm === "boolean")) {
                _values = values.map((itm) => {
                    return { value: itm };
                });
            } else {
                _values = [...values];
            }
        }
    });
</script>

{#if _values.length}
    {#each _values as item}
        <svelte:component
            this={componentConstructor}
            {...item}
            inverted={inverted || item.inverted}
        />
    {/each}
{/if}
