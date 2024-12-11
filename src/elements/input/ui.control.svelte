<script>
    /**
     * @typedef {Object} Props
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { class: classes = "", children } = $props();
</script>

<div class="control {classes}">{@render children?.()}</div>
