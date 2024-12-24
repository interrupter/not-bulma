<script>
    /**
     * @typedef {Object} Props
     * @property {string} [class='']
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { id, class: classes = "", children } = $props();
</script>

<div {id} class="control {classes}">{@render children?.()}</div>
