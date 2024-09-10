<script>
    import { LOCALE } from "../../locale";
    import "bulma-switch";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UIBooleans from "../various/ui.booleans.svelte";
    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value = [];
    export let variants = [];
    export let label = "";
    export let hideLabel = false;
    export let placeholder = "input some text here, please";
    export let fieldname = "textfield";
    export let icon = false;
    export let required = true;
    export let readonly = false;
    export let multiple = true;
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

    function addId(varId) {
        if (!value.includes(varId)) {
            value.push(varId);
            value = value;
        }
    }

    function remId(varId) {
        if (value.includes(varId)) {
            value.splice(value.indexOf(varId), 1);
            value = value;
        }
    }

    function onBlur(ev) {
        console.log("switch list element blur", ev);
        const varId = ev.target.id.split("-variant-").at(-1);
        console.log(varId);
        ev.target.checked ? addId(varId) : remId(varId);
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }

    function onInput(ev) {
        console.log("switch list element input", ev);
        const varId = ev.target.id.split("-variant-").at(-1);
        console.log(varId);
        ev.target.checked ? addId(varId) : remId(varId);
        let data = {
            field: fieldname,
            value,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }
</script>

<div class="control">
    {#if readonly}
        {#if value}
            {variants
                .filter((variant) => value.includes(variant.id))
                .map((variant) => variant.title)
                .join(", ")}
        {/if}
    {:else}
        {#each variants as variant (variant.id)}
            <div class="switch-list-item">
                <input
                    type="checkbox"
                    class="switch {styling}"
                    id="form-field-switch-{fieldname}-variant-{variant.id}"
                    checked={value.includes(variant.id)}
                    name={fieldname}
                    {disabled}
                    {required}
                    {readonly}
                    {invalid}
                    on:blur={onBlur}
                    on:input={onInput}
                    aria-controls="input-field-helper-{fieldname}-variant-{variant.id}"
                    aria-describedby="input-field-helper-{fieldname}-variant-{variant.id}"
                />
                <label
                    class="label"
                    for="form-field-switch-{fieldname}-variant-{variant.id}"
                >
                    {$LOCALE[variant.title]}
                </label>
            </div>
        {/each}
    {/if}
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
