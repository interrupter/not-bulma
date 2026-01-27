<script>
    /**
     * @typedef {Object} Props
     * @property {string} [class]
     */

    /** @type {Props} */
    let {
        classPrefix = "navbar-brand",
        class: classes = "",
        children,
        ...other
    } = $props();
</script>

<div class={[classPrefix, classes].join(" ")} {...other}>
    {@render children?.()}
</div>
