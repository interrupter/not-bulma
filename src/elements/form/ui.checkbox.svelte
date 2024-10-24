<script>
    import { run } from 'svelte/legacy';

    import { LOCALE } from "../../locale";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UIBooleans from "../various/ui.booleans.svelte";

    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {boolean} [value]
     * @property {string} [label]
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {boolean} [icon]
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
        value = $bindable(false),
        label = "checkbox",
        placeholder = "",
        fieldname = "checkbox",
        icon = false,
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
                ev.currentTarget.type === "checkbox"
                    ? ev.currentTarget.checked
                    : value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }

    function onInput(ev) {
        let data = {
            field: fieldname,
            value:
                ev.currentTarget.type === "checkbox"
                    ? ev.currentTarget.checked
                    : value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }
</script>

<div class="control {iconClasses}">
    <label class="checkbox" {disabled} for="form-field-checkbox-{fieldname}">
        {#if readonly}
            <UIBooleans LC_TRUE={label} LC_FALSE={label} values={[{ value }]} />
        {:else}
            <input
                type="checkbox"
                id="form-field-checkbox-{fieldname}"
                bind:checked={value}
                placeholder={$LOCALE[placeholder]}
                name={fieldname}
                {required}
                {readonly}
                {invalid}
                onchange={onBlur}
                oninput={onInput}
                aria-controls="input-field-helper-{fieldname}"
                aria-describedby="input-field-helper-{fieldname}"
                {disabled}
            />
            {$LOCALE[label]}
        {/if}
    </label>
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
