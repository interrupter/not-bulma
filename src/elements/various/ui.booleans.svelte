<script>
    import { onMount } from "svelte";
    import UIBoolean from "./ui.boolean.svelte";

    /**
     * @typedef {Object} Props
     * @property {array}    values
     * @property {boolean}  [inverted = false]
     * @property {function}      [componentConstructor = UIBoolean]
     * @property {function} [itemRenderer]                          if supplied will be used instead of componentConstructor
     */

    /** @type {Props} */
    let {
        values = [],
        inverted = false,
        componentConstructor: ItemConstructor = UIBoolean,
        itemRenderer,
    } = $props();

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
    {#each _values as item, index}
        {#if itemRenderer}
            {@render itemRenderer(item, index)}
        {:else}
            <ItemConstructor {...item} inverted={inverted || item.inverted} />
        {/if}
    {/each}
{/if}
