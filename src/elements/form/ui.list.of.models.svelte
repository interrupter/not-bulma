<script>
    import { COMPONENTS } from "../../frame/LIB.js";
    import notCommon from "../../frame/common.js";
    import UIList from "../list/ui.list.svelte";

    import { createEventDispatcher, onMount } from "svelte";
    const dispatch = createEventDispatcher();
    //field props
    export let inputStarted = false;
    export let value = [];
    export let variants = [];
    export let placeholder = "empty select item";
    export let fieldname = "selectFromModel";
    export let required = true;
    export let readonly = false;
    export let multiple = false;
    export let size = 8;
    //validation
    export let valid = true;
    export let validated = false;
    export let errors = false;
    export let formErrors = false;
    export let formLevelError = false;
    //model bindings
    export let modelName = "";
    export let actionName = "";
    export let actionFilter = {};
    export let actionSorter = {};
    export let actionPager = {};
    export let actionSearch = undefined;
    //presentation
    export let optionId = ":_id";
    export let optionTitle = ":title";
    //selector UI to add new item to list
    export let selectorUI = "UISelectFromModelOnDemandInline";
    export let selectorUIProps = {};
    //list item UI to present in readonly or editable variants
    export let itemUI = "UIListItem";
    export let itemUIProps = {};

    export let transformValueItemToListItem = (item) => {
        return item
            ? {
                  id: item._id,
                  title: item.title,
                  description: item.description,
                  value: item,
              }
            : undefined;
    };

    function addItem(item) {
        if (!Array.isArray(value)) {
            value = [];
        }
        value.push(item);
        value = value;
    }

    $: items = value.map ? value.map(transformValueItemToListItem) : [];

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
    <svelte:component
        this={COMPONENTS.get(selectorUI)}
        {...selectorUIProps}
        {modelName}
        {actionName}
        {actionFilter}
        {actionSorter}
        {actionPager}
        {actionSearch}
        {optionId}
        {optionTitle}
        on:resolve={(e) => addItem(e.detail)}
    />
{/if}
