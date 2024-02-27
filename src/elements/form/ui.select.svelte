<script>
    import { LOCALE } from "../../locale";
    import UISelectOption from "./ui.select.option.svelte";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UICommon from "../common";
    import notCommon from "../../frame/common";

    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value = "";
    export let variants = [];
    export let placeholder = "";
    export let fieldname = "select";
    export let icon = false;
    export let required = true;
    export let readonly = false;
    export let multiple = false;
    export let size = 8;
    export let valid = true;
    export let validated = false;
    export let errors = false;
    export let formErrors = false;
    export let formLevelError = false;

    let selectedVariants = [];

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
    $: multipleClass = multiple ? " is-multiple " : "";
    $: {
        value;
        selectedVariants = Array.isArray(variants)
            ? variants.filter(filterSelectedVariants)
            : [];
    }

    function filterSelectedVariants(variant) {
        if (Array.isArray(value) && multiple) {
            return value.indexOf(variant.id) > -1;
        } else if (value) {
            return value == variant.id;
        } else {
            return false;
        }
    }

    let lastChange;

    function onBlur(ev) {
        let data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        if (lastChange === data.value) {
            return true;
        } else {
            if (
                Array.isArray(data.value) &&
                notCommon.compareTwoArrays(lastChange, data.value)
            ) {
                return true;
            }
        }
        if (multiple) {
            value = Array.from(ev.target.selectedOptions).map((el) => el.value);
            if (value.indexOf(UICommon.CLEAR_MACRO) > -1) {
                value = [];
            }
            data.value = value;
        } else {
            if (data.value === UICommon.CLEAR_MACRO) {
                value = "";
            }
        }
        inputStarted = true;
        dispatch("change", data);
        return true;
    }

    function onInput(ev) {
        let data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        if (multiple) {
            value = Array.from(ev.target.selectedOptions).map((el) => el.value);
            if (value.indexOf(UICommon.CLEAR_MACRO) > -1) {
                value = [];
            }
            data.value = value;
        } else {
            if (data.value === UICommon.CLEAR_MACRO) {
                value = "";
            }
        }
        inputStarted = true;
        lastChange = data.value;
        dispatch("change", data);
        return true;
    }
</script>

<div class="control {iconClasses}">
    {#if readonly}
        {#each selectedVariants as selectedVariant}
            <span class="mr-2">{$LOCALE[selectedVariant.title]}</span>
        {/each}
    {:else}
        <div class="select {validationClasses} {multipleClass}">
            <select
                id="form-field-select-{fieldname}"
                name={fieldname}
                on:blur={onBlur}
                on:input={onInput}
                {readonly}
                {required}
                {multiple}
                size={multiple ? size : false}
            >
                {#if placeholder.length > 0}
                    {#if value}
                        <UISelectOption
                            value={UICommon.CLEAR_MACRO}
                            title={placeholder}
                        />
                    {:else}
                        <UISelectOption
                            value={UICommon.CLEAR_MACRO}
                            selected="selected"
                            title={placeholder}
                        />
                    {/if}
                {/if}
                {#each variants as variant}
                    {#if multiple}
                        <UISelectOption
                            value={variant.id}
                            selected={value && value.indexOf(variant.id) > -1}
                            title={variant.title}
                        />
                    {:else}
                        <UISelectOption
                            value={variant.id}
                            selected={value == variant.id}
                            title={variant.title}
                        />
                    {/if}
                {/each}
            </select>
        </div>
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
