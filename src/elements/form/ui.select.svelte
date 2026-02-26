<script>
    import { run } from "svelte/legacy";
    import { onMount } from "svelte";

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
        inputStarted = false,
        value = "",
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
        onInputStarted = () => {},
        class: classes = "",
        idField = "id",
        titleField = "title",
    } = $props();

    let selectedVariants = $state([]);

    function filterSelectedVariants(variant) {
        if (Array.isArray(value) && multiple) {
            return value.indexOf(variant[idField]) > -1;
        } else if (value) {
            return value == variant[idField];
        } else {
            return false;
        }
    }

    let lastChange, selectElement;

    onMount(() => {
        onInput({ currentTarget: selectElement });
    });

    function getSelectedValues() {
        if (multiple) {
            const _values = Array.from(selectElement.selectedOptions).map(
                (el) => el.value
            );
            if (_values.indexOf(UICommon.CLEAR_MACRO) > -1) {
                return [];
            } else {
                return _values;
            }
        } else {
            if (selectElement.value === UICommon.CLEAR_MACRO) {
                return "";
            } else {
                return selectElement.value;
            }
        }
    }

    function triggerInputStarted() {
        onInputStarted();
        inputStarted = true;
    }

    function onBlur(ev) {
        let data = {
            field: fieldname,
            value: getSelectedValues(),
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
        triggerInputStarted();
        onchange(data);
        return true;
    }

    function onInput(ev) {
        let data = {
            field: fieldname,
            value: getSelectedValues(),
        };
        triggerInputStarted();
        lastChange = data.value;
        onchange(data);
        return true;
    }

    let iconClasses = $derived(
        (icon ? " has-icons-left " : "") + " has-icons-right "
    );

    let allErrors = $state([]);
    run(() => {
        allErrors = [].concat(
            errors ? errors : [],
            formErrors ? formErrors : []
        );
    });

    let showErrors = $state(false);
    run(() => {
        showErrors = !(validated && valid) && inputStarted;
    });
    let invalid = $derived(valid === false || formLevelError);

    let validationClasses = $state("");
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
                <span class="mr-2">{$LOCALE[selectedVariant[titleField]]}</span>
            {/each}
        {:else}
            <span class="mr-2">{$LOCALE[emptyValueTitle]}</span>
        {/if}
    {:else}
        <div class="select {validationClasses} {multipleClass}">
            <select
                bind:this={selectElement}
                id="form-field-select-{fieldname}"
                name={fieldname}
                onblur={onBlur}
                oninput={onInput}
                onchange={onInput}
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
                            value={variant[idField]}
                            selected={value &&
                                value.indexOf(variant[idField]) > -1}
                            title={variant[titleField]}
                        />
                    {:else}
                        <UISelectOption
                            value={variant[idField]}
                            selected={value == variant[idField]}
                            title={variant[titleField]}
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
