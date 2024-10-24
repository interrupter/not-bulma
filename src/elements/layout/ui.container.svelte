<script>
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [classes]
     * @property {boolean} [widescreen]
     * @property {boolean} [fullhd]
     * @property {boolean} [maxDesktop]
     * @property {boolean} [maxWidescreen]
     * @property {boolean} [fluid]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        classes = "",
        widescreen = false,
        fullhd = false,
        maxDesktop = false,
        maxWidescreen = false,
        fluid = false,
        children
    } = $props();
</script>

<div
    {id}
    class="container {classes}"
    class:is-widescreen={widescreen}
    class:is-fullhd={fullhd}
    class:is-max-desktop={maxDesktop}
    class:is-max-widescreen={maxWidescreen}
    class:is-fluid={fluid}
    onclick={bubble('click')}
    onkeyup={bubble('keyup')}
    role="button"
    tabindex="0"
>
    {@render children?.()}
</div>
