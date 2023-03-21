<script>
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";

    import { createEventDispatcher, onMount } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;

    export let value = new Date();
    export let placeholder = "Date and time of event";
    export let fieldname = "datetime";
    export let pattern = "d{4}-d{2}-d{2}";
    export let icon = false;
    export let required = true;
    export let readonly = false;
    export let valid = true;
    export let validated = false;
    export let errors = false;
    export let formErrors = false;
    export let formLevelError = false;

    $: iconClasses = (icon ? " has-icons-left " : "") + " has-icons-right ";
    $: allErrors = [].concat(
        errors ? errors : [],
        formErrors ? formErrors : []
    );
    $: invalid = valid === false || formLevelError;
    $: showErrors = !(validated && valid) && inputStarted;
    $: validationClasses =
        valid === true || !inputStarted
            ? UICommon.CLASS_OK
            : UICommon.CLASS_ERR;

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
            {placeholder}
            bind:value
            {pattern}
            {readonly}
            autocomplete={fieldname}
            aria-controls="input-field-helper-{fieldname}"
            on:change={onBlur}
            on:input={onInput}
            aria-describedby="input-field-helper-{fieldname}"
        />
        {#if icon}
            <span class="icon is-small is-left"
                ><i class="fas fa-{icon}" /></span
            >
        {/if}
        {#if validated === true}
            <span class="icon is-small is-right">
                {#if valid === true}
                    <i class="fas fa-check" />
                {:else if valid === false}
                    <i class="fas fa-exclamation-triangle" />
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
