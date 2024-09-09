<script>
    import { LOCALE } from "../../locale";
    import "bulma-switch";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UIBooleans from "../various/ui.booleans.svelte";
    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value = false;
    export let label = "";
    export let hideLabel = false;
    export let placeholder = "input some text here, please";
    export let fieldname = "textfield";
    export let icon = false;
    export let required = true;
    export let readonly = false;
    export let disabled = false;
    export let valid = true;
    export let styling = " is-rounded is-success ";
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
            on:blur={onBlur}
            on:input={onInput}
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
