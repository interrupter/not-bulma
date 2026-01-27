<script>
    import UICommon from "../../../common";

    /**
     * @typedef {Object} Props
     * @property {string}   [id = ""]
     * @property {string}   [classPrefix = "navbar-item"]
     * @property {string}   [hidden = ""]
     * @property {string}   [class = ""]
     * @property {string}   [role="button"]
     * @property {number}   [tabIndex = 0]
     * @property {function} [onclick = () => true]
     * @property {function} [onkeyup]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        id = "",
        classPrefix = "navbar-item",
        hidden = "",
        class: classes = "",
        role = "button",
        tabIndex = 0,
        children,
        onclick,
        onkeyup,
        ...other
    } = $props();

    const onKeyUp =
        onkeyup ?? (onclick ? UICommon.onlyOnEnter(onclick) : undefined);
</script>

<div
    {id}
    class={[classPrefix, hidden ? `is-hidden-${hidden}` : "", classes].join(
        " "
    )}
    {onclick}
    onkeyup={onKeyUp}
    {role}
    {tabIndex}
>
    {@render children?.()}
</div>
