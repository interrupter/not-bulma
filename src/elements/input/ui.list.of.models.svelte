<script>
    import { COMPONENTS } from "../../frame/LIB.js";
    import notCommon from "../../frame/common.js";
    import UIList from "../list/ui.list.svelte";

    //field props

    /**
     * @typedef {Object} Props
     * @property {boolean} [inputStarted] - svelte-ignore unused-export-let
     * @property {any} [value]
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {boolean} [multiple]
     * @property {number} [size]
     * @property {boolean} [valid] - validation
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {boolean} [formLevelError]
     * @property {string} [modelName] - model bindings
     * @property {string} [actionName]
     * @property {any} [actionFilter]
     * @property {any} [actionSorter]
     * @property {any} [actionPager]
     * @property {any} [actionSearch]
     * @property {string} [optionId] - presentation
     * @property {string} [optionTitle]
     * @property {string} [selectorUI] - selector UI to add new item to list
     * @property {any} [selectorUIProps]
     * @property {string} [itemUI] - list item UI to present in readonly or editable variants
     * @property {any} [itemUIProps]
     * @property {any} [transformValueItemToListItem]
     */

    /** @type {Props} */
    let {
        value = [],
        placeholder = "",
        fieldname = "selectFromModel",
        required = true,
        readonly = false,
        multiple = false,
        size = 8,
        valid = true,
        modelName = "",
        actionName = "",
        actionFilter = {},
        actionSorter = {},
        actionPager = {},
        actionSearch = undefined,
        optionId = ":_id",
        optionTitle = ":title",
        selectorUI = "UISelectFromModelOnDemandInline",
        selectorUIProps = {},
        itemUI = "UIListItem",
        itemUIProps = {},
        transformValueItemToListItem = (item) => {
            return item
                ? {
                      id: item._id,
                      title: item.title,
                      description: item.description,
                      value: item,
                  }
                : undefined;
        },
    } = $props();

    let items = $state([]);
    const transformValueToItems = (val) => {
        return Array.isArray(val) ? val.map(transformValueItemToListItem) : [];
    };

    function addItem(item) {
        if (!Array.isArray($state.snapshot(value))) {
            value = [];
        }
        value.push(item);

        items = transformValueToItems(value);
    }

    const getItemIndexInValue = (listItem) => {
        return value.findIndex((valueItem) => valueItem.id === listItem.id);
    };

    const ACTIONS = [
        {
            action(listItem) {
                const itemIndex = getItemIndexInValue(listItem);
                if (itemIndex > -1) {
                    const valCopy = [...value];
                    notCommon.moveItem(valCopy, itemIndex, itemIndex - 1);
                    value = valCopy;
                    items = transformValueToItems(value);
                }
            },
            title: "",
            icon: "arrow-up",
            color: "normal",
        },
        {
            action: (listItem) => {
                const itemIndex = getItemIndexInValue(listItem);
                if (itemIndex > -1) {
                    const valCopy = [...value];
                    notCommon.moveItem(valCopy, itemIndex, itemIndex + 1);
                    value = valCopy;
                    items = transformValueToItems(value);
                }
            },
            title: "",
            icon: "arrow-down",
            color: "normal",
        },
        {
            action: (listItem) => {
                const itemIndex = getItemIndexInValue(listItem);
                if (itemIndex > -1) {
                    value.splice(itemIndex, 1);

                    items = transformValueToItems(value);
                }
            },
            title: "",
            icon: "trash",
            color: "danger",
        },
    ];
</script>

<UIList
    listItemComponent={COMPONENTS.get(itemUI)}
    {...itemUIProps}
    {items}
    actions={ACTIONS}
/>
{#if !readonly}
    {@const SvelteComponent = COMPONENTS.get(selectorUI)}
    <SvelteComponent
        {...selectorUIProps}
        {modelName}
        {actionName}
        {actionFilter}
        {actionSorter}
        {actionPager}
        {actionSearch}
        {optionId}
        {optionTitle}
        {placeholder}
        {fieldname}
        {required}
        multiple={false}
        {valid}
        onresolve={(e) => addItem(e.value)}
    />
{/if}
