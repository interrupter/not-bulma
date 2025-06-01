<script>
    import notPath from "not-path";

    import UISelect from "./ui.select.svelte";
    import notCommon from "../../frame/common";
    import { DEFAULT_STATUS_SUCCESS } from "../../frame/const";

    import { onMount } from "svelte";

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
        required = true,
        readonly = false,
        multiple = false,
        size = 8,
        valid = true,

        returnVariant = false,
        class: classes = "",
        onchange = () => true,
        onerror = () => {},
        ...others
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
                onerror(response.errors || response.message);
            }
        }
    });

    function onChange(data) {
        if (returnVariant) {
            onchange({
                ...data,
                value: variants.find((itm) => itm.id === data.value),
            });
        } else {
            onchange(data);
        }
    }
</script>

<UISelect
    {value}
    bind:variants
    class={classes}
    {placeholder}
    {emptyValueTitle}
    {fieldname}
    {required}
    {readonly}
    {disabled}
    {size}
    {valid}
    onchange={onChange}
    {...others}
/>
