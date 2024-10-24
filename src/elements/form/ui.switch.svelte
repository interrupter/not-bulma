<script>
    import { run } from 'svelte/legacy';

    import { LOCALE } from "../../locale";
    import "bulma-switch";
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
     * @property {boolean} [hideLabel]
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {boolean} [icon]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [disabled]
     * @property {boolean} [valid]
     * @property {string} [styling]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        inputStarted = $bindable(false),
        value = $bindable(false),
        label = "",
        hideLabel = false,
        placeholder = "",
        fieldname = "textfield",
        icon = false,
        required = true,
        readonly = false,
        disabled = false,
        valid = true,
        styling = " is-rounded is-success ",
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

<div class="control">
    {#if readonly}
        {#if value}
            <UIBooleans values={[{ value: true }]} />
        {:else}
            <UIBooleans values={[{ value: false }]} />
        {/if}
    {:else}
        {#if !label && !hideLabel}
            <UIBooleans values={[{ value: false }]} />
        {/if}
        <input
            type="checkbox"
            class="switch {styling}"
            id="form-field-switch-{fieldname}"
            bind:checked={value}
            placeholder={$LOCALE[placeholder]}
            name={fieldname}
            {disabled}
            {required}
            {readonly}
            {invalid}
            onblur={onBlur}
            oninput={onInput}
            aria-controls="input-field-helper-{fieldname}"
            aria-describedby="input-field-helper-{fieldname}"
        />
        <label class="label" for="form-field-switch-{fieldname}">
            {#if !hideLabel}
                {#if label}
                    {$LOCALE[label]}
                {:else}
                    <UIBooleans values={[{ value: true }]} />
                {/if}
            {/if}
        </label>
    {/if}
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
