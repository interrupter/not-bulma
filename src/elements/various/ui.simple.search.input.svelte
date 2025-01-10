<script>
    import UITextfield from "../input/ui.textfield.svelte";
    import { UIColumn, UIColumns } from "../layout";
    import UIIconFont from "../icon/ui.icon.font.svelte";
    import UIControl from "../input/ui.control.svelte";
    import { UIFormField } from "../form";

    /**
     * @typedef {Object} Props
     * @property {string}   [placeholder = 'not-node:field_search_placeholder']
     * @property {string}   [term = '']
     * @property {string}   [fieldname = 'searchTermInput']
     * @property {string}   [icon = 'search']
     * @property {function} [onchange]
     */

    /** @type {Props} */
    let {
        placeholder = "not-node:field_search_placeholder",
        term = $bindable(""),
        fieldname = "searchTermInput",
        icon = "search",
        iconSide = "left",
        size = "normal",
        required = false,
        ...others
    } = $props();

    let hasIconsLeft = $derived(icon && iconSide === "left");
    let hasIconsRight = $derived(icon && iconSide === "right");
</script>

<UIColumns role="none">
    <UIColumn role="none">
        <UIFormField>
            <UIControl {hasIconsLeft} {hasIconsRight}>
                <UITextfield
                    bind:value={term}
                    {placeholder}
                    {fieldname}
                    {required}
                    {size}
                    role={"searchbox"}
                    {...others}
                />
                {#if icon}
                    <UIIconFont font={icon} side={iconSide} />
                {/if}
            </UIControl>
        </UIFormField>
    </UIColumn>
</UIColumns>
