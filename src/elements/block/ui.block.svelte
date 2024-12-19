<script>
    import UICommon from "../common";
    /**
     * @typedef {Object} Props
     * @property {string}   [id]
     * @property {string}   [class]
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
        onclick = () => true,
        onkeyup,
        children,
    } = $props();

    const onKeyUp =
        onkeyup ?? (onclick ? UICommon.onlyOnEnter(onclick) : undefined);
</script>

<div {id} class="block {classes}" {onclick} onkeyup={onKeyUp} {role} {tabIndex}>
    {@render children?.()}
</div>
