<script>
    import { onMount } from "svelte";
    import UIBoolean from "./ui.boolean.svelte";

    /**
     * @typedef {Object} Props
     * @property {any} [values]
     * @property {boolean} [inverted]
     * @property {any} [componentConstructor]
     */

    /** @type {Props} */
    let { values = [], inverted = false, componentConstructor = UIBoolean } = $props();

    let _values = $state([]);

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
        {@const SvelteComponent = componentConstructor}
        <SvelteComponent
            {...item}
            inverted={inverted || item.inverted}
        />
    {/each}
{/if}
