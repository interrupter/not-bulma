<script>
    import { createBubbler } from "svelte/legacy";

    const bubble = createBubbler();
    /**
     * @typedef {Object} Props
     * @property {string} [class]
     * @property {string} [title]
     * @property {boolean} [narrow]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        class: classes = "",
        title = "",
        narrow = false,
        children,
    } = $props();
</script>

<div
    {title}
    class="column {classes} {narrow ? 'is-narrow' : ''}"
    onclick={bubble("click")}
    onkeyup={bubble("keyup")}
    role="button"
    tabindex="0"
>
    {@render children?.()}
</div>
