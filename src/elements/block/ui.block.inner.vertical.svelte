<script>
    import UIBlock from "./ui.block.svelte";
    export let id = "";
    export let classes = "";

    $: classesInner = `block-inner-vertical ${classes}`;
</script>

<UIBlock bind:id bind:classes={classesInner}>
    <slot />
</UIBlock>
