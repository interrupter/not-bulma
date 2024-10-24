<script>
    import UITextarea from "./ui.textarea.svelte";

    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {any} [value]
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {boolean} [icon]
     * @property {number} [rows]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [disabled]
     * @property {boolean} [valid]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        inputStarted = $bindable(false),
        value = $bindable({}),
        placeholder = "",
        fieldname = "jsonarea",
        icon = false,
        rows = 10,
        required = true,
        readonly = false,
        disabled = false,
        valid = $bindable(true),
        validated = false,
        errors = $bindable(false),
        formErrors = false,
        formLevelError = false
    } = $props();

    let _value = $state("{}");

    onMount(() => {
        _value = JSON.stringify(value, null, 4);
    });

    function change() {
        inputStarted = true;
        dispatch("change", {
            field: fieldname,
            value,
        });
    }

    function validateValueAndChange(val) {
        try {
            value = JSON.parse(val);
            valid = true;
            errors = false;
            change();
        } catch (error) {
            valid = false;
            errors = [error.message];
        }
    }

    function onChange(ev) {
        validateValueAndChange(ev.detail.value);
        return true;
    }
</script>

<UITextarea
    bind:inputStarted
    bind:value={_value}
    on:change={onChange}
    {placeholder}
    {icon}
    {rows}
    {required}
    {readonly}
    {disabled}
    {validated}
    {formErrors}
    {formLevelError}
/>
