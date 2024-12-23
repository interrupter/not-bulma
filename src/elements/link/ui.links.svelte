<script>
    import UILink from "./ui.link.svelte";
    /**
     * @typedef {Object} Props
     * @property {array}  [values=[]]
     * @property {string} [classes='']
     * @property {boolean} [centered=false]
     * @property {boolean} [right=false]
     * @property {boolean} [joined = false]
     * @property {object}   [itemsProps = {}]
     */

    /** @type {Props} */
    let {
        values = [],
        class: classes = "",
        centered = false,
        right = false,
        joined = true,
        itemsProps = {},
    } = $props();
</script>

{#snippet listLinks()}
    {#each values as item (item.id)}
        <UILink {...item} {...itemsProps} />
    {/each}
{/snippet}

{#if joined}
    <div
        class="field has-addons {classes}"
        class:is-centered={centered}
        class:is-right={right}
    >
        <p class="control">
            {@render listLinks()}
        </p>
    </div>
{:else}
    <div
        class="buttons {classes}"
        class:is-centered={centered}
        class:is-right={right}
    >
        {@render listLinks()}
    </div>
{/if}
