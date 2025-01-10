<script>
    import UIFormInputValidatedIcon from "./ui.form.input.validated.icon.svelte";
    import { UIIconFont } from "../icon";

    /**
     * @typedef {Object} Props
     * @property {any} [value]
     * @property {boolean} [readonly]
     * @property {object}  UIInput
     * @property {string} fieldtype
     * @property {string} fieldname
     * @property {string} [fieldnamePrefix = "form-field-"]
     * @property {string} [icon]
     * @property {string} [iconSide = 'left']
     * @property {string} [iconSize= 'small']
     * @property {boolean} [valid = true]
     * @property {boolean} [validated = false]
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        readonly,
        UIInput,
        label,
        fieldtype,
        fieldname,
        fieldnamePrefix = "form-field-",
        icon,
        valid = true,
        validated = false,
        ...others
    } = $props();
</script>

<UIInput {fieldtype} {fieldname} {valid} {readonly} bind:value {...others} />
<!-- edit UI renderer -->
{#if icon}
    <UIIconFont font={icon} side={iconSide} size={iconSize} />
{/if}
{#if !readonly}
    <!-- validated and valid should be created by $state() -->
    <UIFormInputValidatedIcon {validated} {valid}></UIFormInputValidatedIcon>
{/if}
