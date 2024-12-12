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
        value = $bindable([]),
        placeholder = $bindable(""),
        fieldname = $bindable("selectFromModel"),
        required = $bindable(true),
        readonly = false,
        multiple = $bindable(false),
        size = $bindable(8),
        valid = $bindable(true),
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

    function addItem(item) {
        if (!Array.isArray(value)) {
            value = [];
        }
        value.push(item);
        value = value;
    }

    let items = $derived(
        value.map ? value.map(transformValueItemToListItem) : []
    );

    const ACTIONS = [
        {
            action(listItem) {
                const val = listItem.value;
                const itemIndex = value.findIndex(
                    (valueItem) => valueItem === val
                );
                if (itemIndex > -1) {
                    const valCopy = [...value];
                    notCommon.moveItem(valCopy, itemIndex, itemIndex - 1);
                    value = valCopy;
                }
            },
            title: "",
            icon: "arrow-up",
            color: "normal",
        },
        {
            action: (listItem) => {
                const val = listItem.value;
                const itemIndex = value.findIndex(
                    (valueItem) => valueItem === val
                );
                if (itemIndex > -1) {
                    const valCopy = [...value];
                    notCommon.moveItem(valCopy, itemIndex, itemIndex + 1);
                    value = valCopy;
                }
            },
            title: "",
            icon: "arrow-down",
            color: "normal",
        },
        {
            action: (listItem) => {
                const val = listItem.value;
                const itemIndex = value.findIndex(
                    (valueItem) => valueItem === val
                );
                if (itemIndex > -1) {
                    value.splice(itemIndex, 1);
                    value = value;
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
        bind:placeholder
        bind:fieldname
        bind:required
        bind:multiple
        bind:size
        bind:valid
        on:resolve={(e) => addItem(e.detail)}
    />
{/if}
