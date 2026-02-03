<script>
    import { run } from 'svelte/legacy';

    import UIBlock from "./ui.block.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [classes]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let { id = $bindable(""), classes = "", children } = $props();

    let classesInner;
    run(() => {
        classesInner = `block-inner-vertical ${classes}`;
    });
</script>

<UIBlock bind:id bind:classes={classesInner}>
    {@render children?.()}
</UIBlock>
