<script>
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    /**
     * @typedef {Object} Props
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { classes = "", children } = $props();
</script>

<div class="columns {classes}" onclick={bubble('click')} onkeyup={bubble('keyup')} role="button" tabindex="0">
    {@render children?.()}
</div>
