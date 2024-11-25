<script>
    import UICommon from "../common";
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { id = "", classes = "", onclick = () => true, children } = $props();
</script>

<div
    role="button"
    tabindex="0"
    {id}
    class="content {classes}"
    {onclick}
    onkeyup={UICommon.onlyOnEnter(onclick)}
>
    {@render children?.()}
</div>
