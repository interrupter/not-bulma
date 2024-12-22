<script>
    import UITag from "./ui.tag.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [id] - if we want to address this tag
     * @property {any} title
     * @property {any} value
     * @property {any} [actions]
     * @property {string} [class]
     * @property {any} [actionsGroupContructor]
     * @property {any} [actionsGroupProps]
     * @property {boolean} [readonly]
     */

    /** @type {Props} */
    let {
        id = "taggedValueId",
        title,
        value,
        actions = [],
        class: classes = "",
        actionsGroupContructor = UIButtons,
        actionsGroupProps = {},
        readonly = false,
    } = $props();
</script>

<div class="tags has-addons {classes}" {id}>
    {#if title}<UITag {...title} />{/if}
    {#if value}<UITag {...value} />{/if}
    {#if !readonly && actions && actions.length}
        {@const SvelteComponent = actionsGroupContructor}
        <SvelteComponent values={actions} {...actionsGroupProps} />
    {/if}
</div>
