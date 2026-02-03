<script>
    import { run } from "svelte/legacy";

    import { LOCALE } from "../../locale";
    import UISelectOption from "./ui.select.option.svelte";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UICommon from "../common";
    import notCommon from "../../frame/common";

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {string} [value]
     * @property {any} [variants]
     * @property {string} [placeholder]
     * @property {string} [emptyValueTitle]
     * @property {string} [fieldname]
     * @property {boolean} [icon]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [multiple]
     * @property {number} [size]
     * @property {boolean} [valid]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     */

    /** @type {Props} */
    let {
        inputStarted = $bindable(false),
        value = $bindable(""),
        variants = [],
        placeholder = "",
        emptyValueTitle = "",
        fieldname = "select",
        icon = false,
        required = true,
        readonly = false,
        multiple = false,
        size = 8,
        valid = true,
        validated = false,
        errors = false,
        formErrors = false,
        formLevelError = false,
        onchange = () => {},
    } = $props();

    let selectedVariants = $state([]);

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
            } else {
                value = data.value;
            }
        }
        inputStarted = true;
        onchange(data);
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
            } else {
                value = data.value;
            }
        }
        inputStarted = true;
        lastChange = data.value;
        onchange(data);
        return true;
    }
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
    let multipleClass = $derived(multiple ? " is-multiple " : "");
    run(() => {
        value;
        selectedVariants = Array.isArray(variants)
            ? variants.filter(filterSelectedVariants)
            : [];
    });
</script>

<div class="control {iconClasses}">
    {#if readonly}
        {#if value}
            {#each selectedVariants as selectedVariant}
                <span class="mr-2">{$LOCALE[selectedVariant.title]}</span>
            {/each}
        {:else}
            <span class="mr-2">{$LOCALE[emptyValueTitle]}</span>
        {/if}
    {:else}
        <div class="select {validationClasses} {multipleClass}">
            <select
                id="form-field-select-{fieldname}"
                name={fieldname}
                onblur={onBlur}
                oninput={onInput}
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
