<script>
    import notPath from "not-path";
    import UISelect from "../input/ui.select.svelte";
    import { UIButtons, UIButton } from "../button";
    import notCommon from "../../frame/common";
    import { DEFAULT_STATUS_SUCCESS } from "../../frame/const";

    import { onMount } from "svelte";

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted]
     * @property {any} value
     * @property {any} [variants]
     * @property {string} [placeholder]
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
     */

    /** @type {Props} */
    let {
        value,
        variants = $bindable([]),
        placeholder = "empty select item",
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
        onreject = () => false,
        onresolve = () => true,
        onerror = () => true,
    } = $props();

    function argumentsSetProvided() {
        return modelName && actionName && actionFilter;
    }

    let loaded = false;

    let disabled = $derived(!loaded);
    let state = $state("hidden");
    let resultsList = [];

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
                resultsList = response.result;
                variants = resultsList.map((item) => {
                    return {
                        id: notPath.get(optionId, item),
                        title: notPath.get(optionTitle, item),
                    };
                });
            } else {
                onerror(response.errors || [response.message]);
            }
        }
    });

    let resolvedValue;

    function onModelChanged({ value: selectedValue }) {
        resolvedValue = resultsList.find(
            (item) => notPath.get(optionId, item) === selectedValue
        );
    }

    const ACTIONS = {
        add: {
            color: "primary",
            icon: "plus",
            action() {
                state = "show";
            },
        },
        resolve: {
            icon: "check",
            color: "primary",
            action() {
                state = "hidden";
                onresolve(resolvedValue);
            },
        },
        reject: {
            icon: "close",
            color: "danger",
            action() {
                state = "hidden";
                onreject();
            },
        },
    };
</script>

{#if state === "hidden"}
    <UIButton {...ACTIONS.add}></UIButton>
{:else if state == "show"}
    <div class="field has-addons">
        <UISelect
            {value}
            {variants}
            {placeholder}
            {fieldname}
            {required}
            {readonly}
            {disabled}
            {multiple}
            {size}
            {valid}
            onchange={onModelChanged}
        />
    </div>
    <div class="control">
        <UIButtons values={[ACTIONS.resolve, ACTIONS.reject]}></UIButtons>
    </div>
{/if}
