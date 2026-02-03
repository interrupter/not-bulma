<script>
    import { run } from "svelte/legacy";

    import { LOCALE } from "../../locale/index";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";

    import { onMount } from "svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {any} [value]
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {string} [pattern]
     * @property {boolean} [icon]
     * @property {boolean} [required]
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
        value = $bindable(new Date()),
        placeholder = "",
        fieldname = "datetime",
        pattern = "d{4}-d{2}-d{2}",
        icon = false,
        required = true,
        readonly = false,
        valid = true,
        validated = false,
        errors = false,
        formErrors = false,
        formLevelError = false,
        onchange = () => {},
    } = $props();

    let iconClasses = $derived(
        (icon ? " has-icons-left " : "") + " has-icons-right "
    );
    let allErrors;
    run(() => {
        allErrors = [].concat(
            errors ? errors : [],
            formErrors ? formErrors : []
        );
    });
    let invalid = $derived(valid === false || formLevelError);
    let showErrors;
    run(() => {
        showErrors = !(validated && valid) && inputStarted;
    });
    let validationClasses;
    run(() => {
        validationClasses =
            valid === true || !inputStarted
                ? UICommon.CLASS_OK
                : UICommon.CLASS_ERR;
    });

    onMount(() => {
        if (value instanceof Date) {
            value = value.toISOString().split("T")[0];
        } else if (value.indexOf("T") > 0) {
            value = value.split("T")[0];
        }
    });

    function onBlur(ev) {
        let data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        inputStarted = true;
        onchange(data);
        return true;
    }

    function onInput(ev) {
        let data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        inputStarted = true;
        onchange(data);
        return true;
    }
</script>

<div class="control {iconClasses}">
    {#if readonly}
        <p>
            <time datetime={value}
                >{UICommon.tryFormatLocaleDateTime(value)}</time
            >
        </p>
    {:else}
        <input
            class="input {validationClasses}"
            id="form-field-date-{fieldname}"
            type="date"
            name={fieldname}
            {invalid}
            {required}
            placeholder={$LOCALE[placeholder]}
            bind:value
            {pattern}
            {readonly}
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
