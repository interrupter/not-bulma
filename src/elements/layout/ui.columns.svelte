<script>
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [class]
     * @property {string} [title]
     * @property {string}   [role="button"]
     * @property {number}   [tabIndex=0]
     * @property {function} [onclick]
     * @property {function} [onkeyup]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        title = "",
        class: classes = "",
        role = "button",
        tabIndex = "0",
        onclick,
        onkeyup,
        children,
    } = $props();
</script>

<div
    {id}
    {title}
    class="columns {classes}"
    {onclick}
    {onkeyup}
    {role}
    {tabIndex}
>
    {@render children?.()}
</div>
