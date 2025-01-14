<script>
    import notPath from "not-path";
    import UISelect from "../input/ui.select.svelte";
    import { UIButtons, UIButton } from "../button";
    import notCommon from "../../frame/common";

    import { onMount } from "svelte";
    import UIField from "../input/ui.field.svelte";
    import UIControl from "../input/ui.control.svelte";

    const DEFAULT_API_MODEL_GETTER = (
        modelName,
        actionFilter,
        actionSorter,
        actionPager,
        actionSearch
    ) => {
        return notCommon
            .getApp()
            .getModel(modelName)
            .setFilter(actionFilter)
            .setSorter(actionSorter)
            .setPager(actionPager)
            .setSearch(actionSearch);
    };

    const DEFAULT_API_REQUEST = (apiModel, actionName) => {
        return apiModel[`$` + actionName]();
    };

    /**
     * @typedef {Object} Props
     * @property {string}   value                                       id of selected variant
     * @property {array}    [variants = []]                             list of variants
     * @property {boolean}  [loaded = false]                            true if we already loaded variants from server via API
     * @property {string}   [placeholder = "empty select item"]         placeholder title
     * @property {string}   [fieldname = "selectFromModel"]             this input fieldname
     * @property {string}   [modelName = ""]                            API modelName
     * @property {string}   [actionName = ""]                           API actionName
     * @property {object}   [actionFilter = {}]                         API filtering rules
     * @property {object}   [actionSorter = {}]                         API sorting rules
     * @property {object}   [actionPager = {}]                          API pager state
     * @property {object}   [actionSearch = undefined]                  API search string
     * @property {string}   [optionId = ":_id"]                         variant object id field name
     * @property {string}   [optionTitle = ":title"]                    variant object title field name
     * @property {boolean}  [required = false]                          field is required
     * @property {boolean}  [readonly = false]                          field is reaonly
     * @property {number}   [size]                                      how many variants would be visible at once, default: 1
     * @property {boolean}  [valid = true]                              field is valid
     * @property {function} [onreject = () => false]                    callback on reject of selection process
     * @property {function} [onresolve = () => true]                    callback on resolve of selection process
     * @property {function} [onerror = () => true]                      callback on error
     */

    /** @type {Props} */
    let {
        value,
        variants = $bindable([]),
        loaded = false,
        placeholder = "empty select item",
        fieldname = "selectFromModel",
        modelName = "",
        actionName = "",
        actionFilter = {},
        actionSorter = {},
        actionPager = {},
        actionSearch = undefined,
        apiModelGetter = DEFAULT_API_MODEL_GETTER,
        apiRequest = DEFAULT_API_REQUEST,
        optionId = ":_id",
        optionTitle = ":title",
        required = true,
        readonly = false,
        size,
        valid = true,
        onreject = () => false,
        onresolve = () => true,
        onerror = () => true,
    } = $props();

    function argumentsSetProvided() {
        return modelName && actionName && actionFilter;
    }

    let disabled = $derived(!loaded);
    let componentState = $state("hidden");
    let resultsList = [];

    onMount(async () => {
        if (argumentsSetProvided()) {
            const response = await apiRequest(
                apiModelGetter(
                    modelName,
                    actionFilter,
                    actionSorter,
                    actionPager,
                    actionSearch
                ),
                actionName
            );
            if (notCommon.isError(response)) {
                loaded = false;
                onerror(response.errors || [response.message]);
            } else {
                resultsList = response.result;
                variants = resultsList.map((item) => {
                    return {
                        id: notPath.get(optionId, item),
                        title: notPath.get(optionTitle, item),
                    };
                });
                loaded = true;
            }
        }
    });

    let resolvedValue;

    function onModelChanged({ value: selectedValue }) {
        if (resultsList.length > variants.length) {
            resolvedValue = resultsList.find(
                (item) => notPath.get(optionId, item) == selectedValue
            );
        } else {
            resolvedValue = variants.find((item) => item.id == selectedValue);
        }
    }

    const ACTIONS = {
        add: {
            color: "primary",
            icon: "plus",
            action() {
                componentState = "show";
            },
        },
        resolve: {
            icon: "check",
            color: "primary",
            action() {
                componentState = "hidden";
                onresolve({ field: fieldname, value: resolvedValue });
            },
        },
        reject: {
            icon: "xmark",
            color: "danger",
            action() {
                componentState = "hidden";
                onreject();
            },
        },
    };
</script>

{#if componentState === "hidden"}
    <UIButton {...ACTIONS.add}></UIButton>
{:else if componentState == "show"}
    <UIField addons={true}>
        <UIControl>
            <UISelect
                {value}
                {variants}
                {placeholder}
                {fieldname}
                {required}
                {readonly}
                {disabled}
                {size}
                {valid}
                onchange={onModelChanged}
            />
        </UIControl>
        <UIControl>
            <UIButtons values={[ACTIONS.resolve, ACTIONS.reject]}></UIButtons>
        </UIControl>
    </UIField>
{/if}
