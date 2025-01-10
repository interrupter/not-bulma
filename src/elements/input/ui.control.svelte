<script>
    /**
     * @typedef {Object} Props
     * @property {string} [class='']
     * @property {boolean} [hasIconsLeft=false]
     * @property {boolean} [hasIconsRight=false]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        class: classes = "",
        hasIconsLeft = false,
        hasIconsRight = false,
        children,
        ...others
    } = $props();
</script>

<p
    class="control {classes}"
    class:has-icons-left={hasIconsLeft}
    class:has-icons-right={hasIconsRight}
    {...others}
>
    {@render children?.()}
</p>
