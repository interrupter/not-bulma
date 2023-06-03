<script>
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value = "";
    export let placeholder = "input some text here, please";
    export let fieldname = "textfield";
    export let icon = false;
    export let required = true;
    export let disabled = false;
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
    $: showErrors = !(validated && valid) && inputStarted;
    $: invalid = valid === false || formLevelError;
    $: validationClasses =
        valid === true || !inputStarted
            ? UICommon.CLASS_OK
            : UICommon.CLASS_ERR;

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
            type="text"
            name={fieldname}
            {invalid}
            {disabled}
            {required}
            {readonly}
            {placeholder}
            bind:value
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
