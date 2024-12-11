<script>
    import InputErrors from "./ui.form.input.errors.svelte";
    import UIFormInput from "./ui.form.input.svelte";
    import UIControl from "../input/ui.control.svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {boolean} [value]
     * @property {string} [label]
     * @property {string} [placeholder]
     * @property {string} fieldname
     * @property {string} fieldtype
     * @property {boolean} [icon]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [disabled]
     * @property {import('../events.types').UIEventInputChangeCallback} [onchange]
     * @property {boolean} [valid]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        UIInput,
        inputStarted = false,
        label,
        placeholder = "",
        fieldtype,
        fieldname,
        fieldnamePrefix = "form-field-",
        icon = false,
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        validated = false,
        errors = false,
        onchange = () => true,
        formErrors = false,
        ...others
    } = $props();

    let iconClasses = $derived(
        (icon ? " has-icons-left " : "") + " has-icons-right "
    );
</script>

<UIControl class={iconClasses}>
    <UIFormInput
        bind:value
        {UIInput}
        {label}
        {placeholder}
        {fieldtype}
        {fieldname}
        {fieldnamePrefix}
        {icon}
        {required}
        {readonly}
        {disabled}
        {valid}
        {onchange}
        {...others}
    />
</UIControl>

<InputErrors
    {inputStarted}
    {validated}
    {valid}
    {errors}
    {formErrors}
    id="input-field-helper-{fieldname}"
/>
