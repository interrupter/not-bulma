<script>
    /**
     * @typedef {Object} Props
     * @property {string} [class]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { class: classes = "", children, ...others } = $props();
</script>

<div class="columns {classes}" {...others}>
    {@render children?.()}
</div>
