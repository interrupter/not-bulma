<script>
    import UIBlock from "./ui.block.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = $bindable(""),
        classes = "",
        onclick = () => true,
        children,
    } = $props();

    const DEFAULT_CLASSES_INNER = "block-inner-vertical";

    let classesInner = $state(DEFAULT_CLASSES_INNER);

    $effect(() => {
        classesInner = `block-inner-vertical ${classes}`;
    });
</script>

<UIBlock {id} classes={classesInner} {onclick}>
    {@render children?.()}
</UIBlock>
