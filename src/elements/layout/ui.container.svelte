<script>
    /**
     * @typedef {Object} Props
     * @property {string} [id = '']
     * @property {string} [class = '']
     * @property {string} [title]
     * @property {string}   [role="button"]
     * @property {number}   [tabIndex=0]
     * @property {boolean} [widescreen=false]
     * @property {boolean} [fullhd=false]
     * @property {boolean} [maxDesktop=false]
     * @property {boolean} [maxWidescreen=false]
     * @property {boolean} [fluid = false]
     * @property {import('svelte').Snippet} [children]
     * @property {function} [onclick]
     * @property {function} [onkeyup]
     */

    /** @type {Props} */
    let {
        id = "",
        title = "",
        class: classes = "",
        role = "button",
        tabIndex = "0",
        widescreen = false,
        fullhd = false,
        maxDesktop = false,
        maxWidescreen = false,
        fluid = false,
        children,
        onclick,
        onkeyup,
    } = $props();
</script>

<div
    {id}
    {title}
    class="container {classes}"
    class:is-widescreen={widescreen}
    class:is-fullhd={fullhd}
    class:is-max-desktop={maxDesktop}
    class:is-max-widescreen={maxWidescreen}
    class:is-fluid={fluid}
    {onclick}
    {onkeyup}
    {role}
    {tabIndex}
>
    {@render children?.()}
</div>
