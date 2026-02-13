<script>
    import UILink from "./ui.link.svelte";
    import UICommon from "../common";

    /**
     * @typedef {Object} Props
     * @property {any} [values]
     * @property {string} [classes]
     * @property {boolean} [centered]
     * @property {boolean} [right]
     * @property {boolean} [joined]
     */

    /** @type {Props} */
    let {
        values = [],
        classes = "",
        centered = false,
        right = false,
        joined = true,
    } = $props();

    if (!values.every((itm) => Object.hasOwn(itm, "id"))) {
        values = UICommon.addIds(values);
    }
</script>

{#if joined}
    <div
        class="field has-addons {centered ? 'is-centered' : ''} {right
            ? 'is-right'
            : ''} {classes}"
    >
        <p class="control">
            {#each values as item (item.id)}
                <UILink {...item} />
            {/each}
        </p>
    </div>
{:else}
    <div
        class="buttons {centered ? 'is-centered' : ''} {right
            ? 'is-right'
            : ''} {classes}"
    >
        {#each values as item (item.id)}
            <UILink {...item} />
        {/each}
    </div>
{/if}
