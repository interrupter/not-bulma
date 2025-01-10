<script>
    /**
     * @typedef {Object} Props
     * @property {string} [class]
     * @property {boolean} [narrow=false]
     * @property {any} size
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        class: classes = "",
        size,
        narrow = false,
        children,
        ...others
    } = $props();
</script>

<div
    class="column {classes} {size ? `is-${size}` : ''}"
    class:is-narrow={narrow}
    {...others}
>
    {@render children?.()}
</div>
