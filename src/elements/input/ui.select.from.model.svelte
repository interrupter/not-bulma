<script>
    import notPath from "not-path";

    import UISelect from "./ui.select.svelte";
    import notCommon from "../../frame/common";
    import { DEFAULT_STATUS_SUCCESS } from "../../frame/const";

    import { onMount } from "svelte";

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
     * @property {any} value
     * @property {string} [placeholder]
     * @property {string} [emptyValueTitle]
     * @property {string} [emptyValue]
     * @property {boolean} [emptyValueEnabled]
     * @property {string} [fieldname]
     * @property {string} [modelName]
     * @property {string} [actionName]
     * @property {any} [actionFilter]
     * @property {any} [actionSorter]
     * @property {any} [actionPager]
     * @property {any} [actionSearch]
     * @property {string} [optionId]
     * @property {string} [optionTitle]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [returnVariant]
     * @property {function} [onchange = ({value:array of string|number, field:string, variants:array of object})=>true]
     * @property {function} [onerror = (message:string):void]
     */

    /** @type {Props} */
    let {
        value,
        modelName = "",
        actionName = "",
        actionFilter = {},
        actionSorter = {},
        actionPager = {},
        actionSearch = undefined,
        optionId = ":_id",
        optionTitle = ":title",
        disabled = false,
        apiModelGetter = DEFAULT_API_MODEL_GETTER,
        apiRequest = DEFAULT_API_REQUEST,
        returnVariant = false,
        class: classes = "",
        onchange = () => true,
        onerror = () => {},
        ...others
    } = $props();

    function argumentsSetProvided() {
        return modelName && actionName && actionFilter;
    }

    let loaded = $state(false);
    let variants = $state([]);
    let resultsList = [];
    let uiDisabled = $derived(disabled || !loaded);

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
    {variants}
    class={classes}
    disabled={uiDisabled}
    onchange={onChange}
    loading={!loaded}
    {...others}
/>
