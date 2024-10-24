<script>
    import { run } from 'svelte/legacy';

    import { LOCALE } from "../../locale";
    import UICommon from "../common.js";
    import ErrorsList from "../various/ui.errors.list.svelte";

    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    
    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {any} [value]
     * @property {string} [fieldname]
     * @property {boolean} [readonly] - export let placeholder = '';
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
        value = [],
        fieldname = "checkbox-list",
        readonly = false,
        disabled = false,
        valid = true,
        validated = false,
        errors = false,
        formErrors = false,
        formLevelError = false
    } = $props();

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
        let id = parseInt(ev.currentTarget.dataset.id);
        let copy = [...value];
        copy.find((itm) => itm.id == id).value = ev.currentTarget.checked;
        let data = {
            id,
            field: fieldname,
            value: copy,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }

    function onInput(ev) {
        let id = parseInt(ev.currentTarget.dataset.id);
        let copy = [...value];
        copy.find((itm) => itm.id === id).value = ev.currentTarget.checked;
        let data = {
            id,
            field: fieldname,
            value: copy,
        };
        inputStarted = true;
        dispatch("change", data);
        return true;
    }
</script>

<div class="control">
    {#each value as item (item.id)}
        <label
            class="checkbox pr-2"
            disabled={disabled || item.disabled}
            for="form-field-checkbox-{fieldname + '_' + item.id}"
        >
            <input
                data-id={item.id}
                id="form-field-checkboxlist-{fieldname + '_' + item.id}"
                type="checkbox"
                bind:checked={item.value}
                placeholder={LOCALE[item.placeholder]}
                name={fieldname + "_" + item.id}
                {readonly}
                {invalid}
                onchange={onBlur}
                oninput={onInput}
                aria-controls="input-field-helper-{fieldname + '_' + item.id}"
                aria-describedby="input-field-helper-{fieldname +
                    '_' +
                    item.id}"
                disabled={disabled || item.disabled}
            />
            {$LOCALE[item.label]}
        </label>
    {/each}
</div>
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
