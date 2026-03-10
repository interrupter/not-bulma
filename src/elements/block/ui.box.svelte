<script>
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        class: classes = "",
        role = "button",
        onclick,
        onkeyup,
        onkeydown,
        children,
    } = $props();
</script>

<div {id} class="box {classes} " {onclick} {onkeyup} {onkeydown} {role}>
    {@render children?.()}
</div>
