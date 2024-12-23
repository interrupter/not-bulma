<script>
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [class]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { id = "", class: classes = "", children } = $props();
</script>

<footer {id} class="footer {classes} ">
    {@render children?.()}
</footer>
