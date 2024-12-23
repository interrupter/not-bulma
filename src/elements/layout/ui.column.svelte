<script>
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [class]
     * @property {string} [title]
     * @property {boolean} [narrow]
     * @property {string}   [role="button"]
     * @property {number}   [tabIndex=0]
     * @property {function} [onclick]
     * @property {function} [onkeyup]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        class: classes = "",
        title = "",
        narrow = false,
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
    class="column {classes}"
    class:is-narrow={narrow}
    {onclick}
    {onkeyup}
    {role}
    {tabIndex}
>
    {@render children?.()}
</div>
