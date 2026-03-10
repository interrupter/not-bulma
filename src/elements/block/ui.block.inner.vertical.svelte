<script>
    import UIBlock from "./ui.block.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { id, class: classes = "", children } = $props();

    let classesInner;

    $effect(() => {
        classesInner = `block-inner-vertical ${classes}`;
    });
</script>

<UIBlock {id} class={classesInner}>
    {@render children?.()}
</UIBlock>
