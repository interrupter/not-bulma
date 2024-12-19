<script>
    import UICommon from "../common";
    import UIBlock from "./ui.block.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [id]
     * @property {string} [class]
     * @property {string}   [role="button"]
     * @property {number}   [tabIndex=0]
     * @property {function} [onclick = () => true]
     * @property {function} [onkeyup]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        class: classes = "",
        role = "button",
        tabIndex = 0,
        onkeyup,
        onclick = () => true,
        children,
    } = $props();

    const DEFAULT_CLASSES_INNER = "block-inner-vertical";

    let classesInner = $state(DEFAULT_CLASSES_INNER);

    $effect(() => {
        classesInner = `block-inner-vertical ${classes}`;
    });

    const onKeyUp =
        onkeyup ?? (onclick ? UICommon.onlyOnEnter(onclick) : undefined);
</script>

<UIBlock
    {id}
    class={classesInner}
    {onclick}
    onkeyup={onKeyUp}
    {role}
    {tabIndex}
>
    {@render children?.()}
</UIBlock>
