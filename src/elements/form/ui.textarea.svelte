<script>
    import { run } from 'svelte/legacy';

    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {string} [value]
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
        value = $bindable(""),
        placeholder = "",
        fieldname = "textarea",
        icon = false,
        rows = 10,
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        validated = false,
        errors = false,
        formErrors = false,
        formLevelError = false
    } = $props();

    let iconClasses = $derived((icon ? " has-icons-left " : "") + " has-icons-right ");
    let allErrors;
    run(() => {
        allErrors = [].concat(
            errors ? errors : [],
            formErrors ? formErrors : []
        );
    });
    let showErrors;
    run(() => {
        showErrors = !(validated && valid) && inputStarted;
    });
    let invalid = $derived(valid === false || formLevelError);
    let validationClasses;
    run(() => {
        validationClasses =
            valid === true || !inputStarted
                ? UICommon.CLASS_OK
                : UICommon.CLASS_ERR;
    });

    function onBlur(ev) {
        let data = {
            field: fieldname,
            value:
                ev.target.type === "checkbox"
                    ? ev.target.checked
                    : ev.target.value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }

    function onInput(ev) {
        let data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }
</script>

<div class="control {iconClasses}">
    {#if readonly}
        <p>{value}</p>
    {:else}
        <textarea
            id="form-field-textarea-{fieldname}"
            {invalid}
            {disabled}
            {required}
            {readonly}
            onblur={onBlur}
            class="textarea {validationClasses}"
            bind:value
            name={fieldname}
            placeholder={$LOCALE[placeholder]}
            {rows}
            aria-controls="input-field-helper-{fieldname}"
            aria-describedby="input-field-helper-{fieldname}"
></textarea>
        {#if icon}
            <span class="icon is-small is-left"
                ><i class="fas fa-{icon}"></i></span
            >
        {/if}
        {#if validated === true}
            <span class="icon is-small is-right">
                {#if valid === true}
                    <i class="fas fa-check"></i>
                {:else if valid === false}
                    <i class="fas fa-exclamation-triangle"></i>
                {/if}
            </span>
        {/if}
    {/if}
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
