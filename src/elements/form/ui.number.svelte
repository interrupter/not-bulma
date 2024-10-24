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
     * @property {number} [value]
     * @property {string} [placeholder]
     * @property {number} [min]
     * @property {number} [max]
     * @property {number} [step]
     * @property {string} [fieldname]
     * @property {boolean} [icon]
     * @property {boolean} [required]
     * @property {boolean} [disabled]
     * @property {boolean} [readonly]
     * @property {boolean} [valid]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        inputStarted = $bindable(false),
        value = $bindable(0),
        placeholder = "0.0",
        min = 0,
        max = 100,
        step = 1,
        fieldname = "number",
        icon = false,
        required = true,
        disabled = false,
        readonly = false,
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

    function onBlur(/*ev*/) {
        let data = {
            field: fieldname,
            value,
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
        <input
            id="form-field-textfield-{fieldname}"
            class="input {validationClasses}"
            type="number"
            {min}
            {max}
            {step}
            name={fieldname}
            {invalid}
            {disabled}
            {required}
            {readonly}
            placeholder={$LOCALE[placeholder]}
            bind:value
            autocomplete={fieldname}
            aria-controls="input-field-helper-{fieldname}"
            onchange={onBlur}
            oninput={onInput}
            aria-describedby="input-field-helper-{fieldname}"
        />
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
