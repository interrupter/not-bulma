<script>
    /**
     * @typedef {Object} Props
     * @property {string} [id = '']
     * @property {any} size
     * @property {string} [class]
     * @property {string} [role="button"]
     * @property {number} [tabIndex = 0]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        size,
        class: classes = "",
        role = "button",
        tabIndex = "0",
        onclick,
        onkeyup,
        children,
    } = $props();
</script>

<section
    {id}
    class="section {size ? 'is-' + size : ''}  {classes}"
    {onclick}
    {onkeyup}
    {role}
    {tabIndex}
>
    {@render children?.()}
</section>
