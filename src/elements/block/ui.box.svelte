<script>
    import { createBubbler } from 'svelte/legacy';

    const bubble = createBubbler();
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { id = "", classes = "", children } = $props();
</script>

<div
    {id}
    class="box {classes} "
    onclick={bubble('click')}
    onkeyup={() => dispatch("click")}
    role="button"
>
    {@render children?.()}
</div>
