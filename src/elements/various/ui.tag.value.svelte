<script>
    import UITag from "./ui.tag.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    /**
     * @typedef {Object} Props
     * @property {string}   [id = "taggedValueId"] - if we want to address this tag
     * @property {object}   title
     * @property {object}   value
     * @property {array}    [actions = []]
     * @property {string}   [class = '']
     * @property {any}      [actionsGroupContructor = UIButtons]
     * @property {any}      [actionsGroupProps = {}]
     * @property {boolean}  [readonly = false]
     */

    /** @type {Props} */
    let {
        id = "taggedValueId",
        title,
        value,
        actions = [],
        class: classes = "",
        actionsGroupContructor: ActionsGroupContructor = UIButtons,
        actionsGroupProps = {},
        readonly = false,
    } = $props();
</script>

<div class="tags has-addons {classes}" {id}>
    {#if title}<UITag {...title} />{/if}
    {#if value}<UITag {...value} />{/if}
</div>
{#if !readonly && actions && actions.length}
    <ActionsGroupContructor values={actions} {...actionsGroupProps} />
{/if}
