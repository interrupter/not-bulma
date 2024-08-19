<script>
    import notPath from "not-path";
    import { LOCALE } from "../../locale";
    import UISelect from "./ui.select.svelte";
    import notCommon from "../../frame/common";
    import { DEFAULT_STATUS_SUCCESS } from "../../frame/const";

    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value;
    export let placeholder = "empty select item";
    export let emptyValueTitle = "";
    export let fieldname = "selectFromModel";
    export let modelName = "";
    export let actionName = "";
    export let actionFilter = {};
    export let actionSorter = {};
    export let actionPager = {};
    export let actionSearch = undefined;
    export let optionId = ":_id";
    export let optionTitle = ":title";
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
    export let returnVariant = false;

    function argumentsSetProvided() {
        return modelName && actionName && actionFilter;
    }

    let loaded = false;
    let variants = [];

    $: disabled = !loaded;

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
