<script>
    import { onMount } from "svelte";

    //
    import UIList from "../ui.list.svelte";
    import UITitle from "../../various/ui.title.svelte";
    import UIImage from "../../image/ui.image.svelte";
    import UIButtons from "../../button/ui.buttons.svelte";
    import UIButtonsSwitchers from "../../button/ui.buttons.switchers.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [fieldname]
     * @property {any} [variants] - [
array of groups
{
id:number,
title:string|object,
image:string|object,
variants = [
array of values variants in group
{
id:number,
title:string|object,
description:string|object,
image:string|object,
value:object
}]
}
]
     * @property {any} [variantsSelected] - multiple && multiple in group
{
array of arrays of selected values in group
if no selection group should be empty array
[groupId]: [...variantsId]
}
multiple && one in group
{
[groupId]: variantId
}
only one (not multiple && one in group)
{
group: groupId
value: variantId
}
     * @property {any} value - {[groupId]: [...valuesOfSelectedItems]}
     * @property {any} [titleComponent]
     * @property {any} [titleComponentProps]
     * @property {any} [imageComponent]
     * @property {any} [imageComponentProps]
     * @property {any} [descriptionComponent]
     * @property {any} [descriptionComponentProps]
     * @property {any} [listComponent]
     * @property {any} [listComponentProps]
     * @property {any} [actionsList]
     * @property {any} [sublimeValue]
     */

    /** @type {Props} */
    let {
        onchange = () => true,
        fieldname = "list-select-tags",
        variants = $bindable([]),

        value = $bindable(),
        titleComponent = UITitle,
        titleComponentProps = { size: 5 },
        imageComponent = UIImage,
        imageComponentProps = { covered: true },
        descriptionComponent = UIButtonsSwitchers,
        descriptionComponentProps = {},
        listComponent: UIListComponent = UIList,
        listComponentProps = {},
        actionsList = ["selectAll", "deselectAll"],
        sublimeValue = (value) => {
            return {
                groupId: value.group,
                valueId: value.id,
            };
        },
    } = $props();
    //

    const AVAILABLE_ACTIONS = {
        selectAll: {
            title: "Выбрать все",
            color: "success",
            action() {
                selectAll();
            },
        },
        deselectAll: {
            title: "Снять выделение со всех",
            color: "",
            action() {
                deselectAll();
            },
        },
    };

    let ACTIONS = $state([]);

    onMount(() => {
        actionsList.forEach((name) => {
            Object.hasOwn(AVAILABLE_ACTIONS, name)
                ? ACTIONS.push(AVAILABLE_ACTIONS[name])
                : false;
        });
        ACTIONS = ACTIONS;
    });

    export const selectAll = () => {
        setSelectionOfAll(true);
    };

    export const deselectAll = () => {
        setSelectionOfAll(false);
    };

    export const selectGroup = (groupId) => {
        setSelectionOfGroup(groupId, true);
    };

    export const deselectGroup = (groupId) => {
        setSelectionOfGroup(groupId, false);
    };

    export const setSelectionOfGroup = (groupId, selection) => {
        variants.forEach((group) => {
            if (groupId === group.id) {
                group.description.values.forEach((itm) => {
                    itm.selected = selection;
                });
            }
        });
        variants = variants;
        triggerChange();
    };

    export const setSelectionOfAll = (selection) => {
        variants.forEach((group) => {
            group.description.values.forEach((itm) => {
                itm.selected = selection;
            });
        });
        variants = variants;
        triggerChange();
    };

    export function getSelectedItems() {
        let result = {};
        variants.forEach((group) => {
            if (!Object.hasOwn(result, group.id)) {
                result[group.id] = [];
            }
            group.description.values.forEach((itm) => {
                if (itm.selected) {
                    result[group.id].push(sublimeValue(itm.value));
                }
            });
        });
        return result;
    }

    function triggerChange() {
        value = getSelectedItems();
        onchange({
            fieldname,
            value,
        });
    }
</script>

<UIButtons values={ACTIONS} centered={true} />

<UIListComponent
    {...listComponentProps}
    bind:items={variants}
    {titleComponent}
    {titleComponentProps}
    {descriptionComponent}
    descriptionComponentProps={{
        action(event, value, selected) {
            setTimeout(triggerChange, 0);
            return !selected;
        },
        ...descriptionComponentProps,
    }}
    {imageComponent}
    {imageComponentProps}
/>
