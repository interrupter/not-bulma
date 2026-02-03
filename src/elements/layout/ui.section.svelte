<script>
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {any} size
     * @property {string} [classes]
     * @property {number} [tabindex]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        size,
        classes = "",
        tabindex = 0,
        children
    } = $props();
</script>

<section
    {id}
    class="section {size ? 'is-' + size : ''}  {classes}"
    onclick={bubble('click')}
    onkeyup={bubble('keyup')}
    role="button"
    {tabindex}
>
    {@render children?.()}
</section>
