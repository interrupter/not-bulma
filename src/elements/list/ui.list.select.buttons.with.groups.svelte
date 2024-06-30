<script>
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    //
    import UIList from "./ui.list.svelte";
    import UITitle from "../various/ui.title.svelte";
    import UIImage from "../image/ui.image.svelte";
    import UIButtons from "../button/ui.buttons.svelte";
    import UIButtonsSwitchers from "../button/ui.buttons.switchers.svelte";

    export let fieldname = "list-select-tags";

    /*
    [
        //array of groups
        {
            id:number,
            title:string|object,
            image:string|object,
            variants = [
                //array of values variants in group
                {
                id:number,
                title:string|object,
                description:string|object,
                image:string|object,
                value:object
            }]
        }
    ]
    */
    export let variants = [];
    /*
    multiple && multiple in group
    {
        //array of arrays of selected values in group
        //if no selection group should be empty array
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
    */
    export let variantsSelected = {};
    //{[groupId]: [...valuesOfSelectedItems]}
    export let value;
    //
    export let titleComponent = UITitle;
    export let titleComponentProps = { size: 5 };
    //
    export let imageComponent = UIImage;
    export let imageComponentProps = { covered: true };
    //
    export let descriptionComponent = UIButtonsSwitchers;
    export let descriptionComponentProps = {};
    //
    export let listComponent = UIList;
    export let listComponentProps = {};

    export let actionsList = ["selectAll", "deselectAll"];
    //
    export let sublimeValue = (value) => {
        return {
            groupId: value.group,
            valueId: value.id,
        };
    };
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

    let ACTIONS = [];

    onMount(() => {
        actionsList.forEach((name) => {
            Object.hasOwn(AVAILABLE_ACTIONS, name)
                ? ACTIONS.push(AVAILABLE_ACTIONS[name])
                : false;
        });
        ACTIONS = ACTIONS;
    });

    function changeItemSelection(groupId, valueId, selected) {
        const group = variants.find((group) => group.id === groupId);
        if (group) {
            const item = group.description.values.find(
                (groupItem) => groupItem.value.id === valueId
            );
            if (item) {
                item.selected = selected;
            }
        }
        variants = variants;
        triggerChange();
    }

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
        dispatch("change", {
            fieldname,
            value,
        });
    }
</script>

<UIButtons values={ACTIONS} centered={true} />

<svelte:component
    this={listComponent}
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
