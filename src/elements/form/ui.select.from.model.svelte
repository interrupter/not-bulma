<script>
    import notPath from "not-path";
    import { LOCALE } from "../../locale";
    import UISelect from "./ui.select.svelte";
    import notCommon from "../../frame/common";
    import { DEFAULT_STATUS_SUCCESS } from "../../frame/const";

    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {any} value
     * @property {string} [placeholder]
     * @property {string} [emptyValueTitle]
     * @property {string} [fieldname]
     * @property {string} [modelName]
     * @property {string} [actionName]
     * @property {any} [actionFilter]
     * @property {any} [actionSorter]
     * @property {any} [actionPager]
     * @property {any} [actionSearch]
     * @property {string} [optionId]
     * @property {string} [optionTitle]
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
     * @property {boolean} [returnVariant]
     */

    /** @type {Props} */
    let {
        inputStarted = false,
        value,
        placeholder = "",
        emptyValueTitle = "",
        fieldname = "selectFromModel",
        modelName = "",
        actionName = "",
        actionFilter = {},
        actionSorter = {},
        actionPager = {},
        actionSearch = undefined,
        optionId = ":_id",
        optionTitle = ":title",
        icon = false,
        required = true,
        readonly = false,
        multiple = false,
        size = 8,
        valid = true,
        validated = false,
        errors = $bindable(false),
        formErrors = false,
        formLevelError = false,
        returnVariant = false
    } = $props();

    function argumentsSetProvided() {
        return modelName && actionName && actionFilter;
    }

    let loaded = false;
    let variants = $state([]);

    let disabled = $derived(!loaded);

    onMount(async () => {
        if (argumentsSetProvided()) {
            const notApp = notCommon.getApp();
            const Model = notApp
                .getModel(modelName)
                .setFilter(actionFilter)
                .setSorter(actionSorter)
                .setPager(actionPager)
                .setSearch(actionSearch);
            const response = await Model[`$` + actionName]();
            if (response.status === DEFAULT_STATUS_SUCCESS) {
                const result = response.result;
                variants = result.map((item) => {
                    return {
                        id: notPath.get(optionId, item),
                        title: notPath.get(optionTitle, item),
                    };
                });
            } else {
                errors = result.errors || [result.message];
            }
        }
    });

    function onChange(e) {
        if (returnVariant) {
            dispatch("change", {
                ...e.detail,
                value: variants.find((itm) => itm.id === e.detail.value),
            });
        } else {
            dispatch("change", e.detail);
        }
    }
</script>

<UISelect
    {inputStarted}
    {value}
    bind:variants
    {placeholder}
    {emptyValueTitle}
    {fieldname}
    {icon}
    {required}
    {readonly}
    {disabled}
    {multiple}
    {size}
    {valid}
    {validated}
    {errors}
    {formErrors}
    {formLevelError}
    on:change={onChange}
/>
