<script>
    import UICommon from "../common";
    /**
     * @typedef {Object} Props
     * @property {string}   [class]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { class: classes = "", children, ...others } = $props();
</script>

<div class="block {classes}" {...others}>
    {@render children?.()}
</div>
