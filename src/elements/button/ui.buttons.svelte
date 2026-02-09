<script>
    import { onMount } from "svelte";
    import UICommon from "../common";

    import UIButton from "./ui.button.svelte";

    /**
     * @typedef {Object} Props
     * @property {any} [values]
     * @property {boolean} [centered]
     * @property {boolean} [right]
     * @property {string} [classes]
     * @property {any} [buttonComponent]
     * @property {any} [action]
     */

    /** @type {Props} */
    let {
        values = [],
        centered = false,
        right = false,
        classes = "",
        buttonComponent = UIButton,
        onclick = () => {},
        action = (e) => {
            onclick(e);
        },
    } = $props();

    if (!values.every((itm) => Object.hasOwn(itm, "id"))) {
        values = UICommon.addIds(values);
    }
</script>

<div
    class="buttons has-addons {centered ? 'is-centered' : ''} {right
        ? 'is-right'
        : ''} {classes}"
>
    {#if Array.isArray(values)}
        {#each values as item (item.id)}
            {@const SvelteComponent = buttonComponent}
            <SvelteComponent
                {...item}
                bind:value={item.value}
                action={item.action ? item.action : action}
                {onclick}
            />
        {/each}
    {/if}
</div>
