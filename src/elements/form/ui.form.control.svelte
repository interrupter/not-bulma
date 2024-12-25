<script>
    import UILabel from "../input/ui.label.svelte";
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
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        UIInput,
        inputStarted = false,
        label,
        labelVertical = true,
        placeholder = "",
        fieldtype,
        fieldname,
        fieldnamePrefix = "form-field-",
        icon = "",
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        validated = false,
        onchange = () => true,
        onerror = () => true,
        formErrors = [],
        errors = [],
        ...others
    } = $props();

    let iconClasses = $derived(
        (icon ? " has-icons-left " : "") + " has-icons-right "
    );
</script>

{#snippet control()}
    <UIControl class={iconClasses}>
        <UIFormInput
            bind:value
            {UIInput}
            {placeholder}
            {fieldtype}
            {fieldname}
            {fieldnamePrefix}
            {icon}
            {required}
            {readonly}
            {disabled}
            {inputStarted}
            {validated}
            {valid}
            {onchange}
            {onerror}
            {...others}
        />
    </UIControl>
{/snippet}

{#if label}
    {#if labelVertical}
        <UILabel
            class={fieldtype}
            for="{fieldnamePrefix}{fieldtype}-{fieldname}"
            {label}
        />
        {@render control()}
    {:else}
        <UILabel
            class={fieldtype}
            for="{fieldnamePrefix}{fieldtype}-{fieldname}"
        >
            {label}: {@render control()}
        </UILabel>
    {/if}
{:else}
    {@render control()}
{/if}

<InputErrors
    {inputStarted}
    {validated}
    {valid}
    {errors}
    {formErrors}
    id="input-field-helper-{fieldname}"
/>
