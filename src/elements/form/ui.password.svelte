<script>
    import { LOCALE } from "../../locale";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";

    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value = "";
    export let placeholder = "";
    export let fieldname = "password";
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
    $: showErrors = !(validated && valid) && inputStarted;
    $: invalid = valid === false || formLevelError;
    $: validationClasses =
        valid === true || !inputStarted
            ? UICommon.CLASS_OK
            : UICommon.CLASS_ERR;
    $: {
    }

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
    <input
        class="input {validationClasses}"
        {readonly}
        id="form-field-password-{fieldname}"
        type="password"
        name={fieldname}
        {invalid}
        {required}
        placeholder={$LOCALE[placeholder]}
        bind:value
        autocomplete={fieldname}
        aria-controls="input-field-helper-{fieldname}"
        on:change={onBlur}
        on:input={onInput}
        aria-describedby="input-field-helper-{fieldname}"
    />
    {#if icon}
        <span class="icon is-small is-left"><i class="fas fa-{icon}" /></span>
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
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
