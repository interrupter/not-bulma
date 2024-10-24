<script>
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    //
    import UIList from "./ui.list.svelte";
    import UITitle from "../various/ui.title.svelte";
    import UIImage from "../image/ui.image.svelte";
    import UIButtons from "../button/ui.buttons.svelte";


    
    
    
    
    
    
    
    
    
    
    /**
     * @typedef {Object} Props
     * @property {string} [fieldname]
     * @property {boolean} [multiple]
     * @property {boolean} [onlyOneInGroup]
     * @property {boolean} [atLeastOne]
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
     * @property {any} [sublimeValue]
     * @property {any} [getItem]
     * @property {any} [getItemValue]
     * @property {any} [getDefaultItemSublime]
     * @property {any} [uiOn]
     * @property {any} [uiOff]
     */

    /** @type {Props} */
    let {
        fieldname = "list-select-tags",
        multiple = false,
        onlyOneInGroup = true,
        atLeastOne = true,
        variants = $bindable([]),
        variantsSelected = $bindable({}),
        value = $bindable(),
        titleComponent = UITitle,
        titleComponentProps = { size: 5 },
        imageComponent = UIImage,
        imageComponentProps = { covered: true },
        descriptionComponent = UIButtons,
        descriptionComponentProps = {},
        listComponent = UIList,
        listComponentProps = {},
        sublimeValue = (value) => {
        return {
            groupId: value.group,
            valueId: value.id,
        };
    },
        getItem = ({ groupId, valueId }) => {
        return variants
            .find((group) => group.id === groupId)
            .description.values.find((btnVal) => btnVal.value.id === valueId);
    },
        getItemValue = ({ groupId, valueId }) => {
        return getItem({ groupId, valueId }).value;
    },
        getDefaultItemSublime = () => {
        return {
            groupId: variants[0].id,
            valueId: variants[0].description.values[0].value.id,
        };
    },
        uiOn = (item) => {
        item.color = "success";
        item.outlined = false;
    },
        uiOff = (item) => {
        item.color = false;
        item.outlined = false;
    }
    } = $props();

    onMount(() => {
        if (value) {
            if (multiple) {
                if (onlyOneInGroup) {
                    for (let t of Object.keys(value)) {
                        const itemValue = value[t];
                        let ui = updateSelected(itemValue);
                        updateUI(ui);
                    }
                } else {
                    for (let t of Object.keys(value)) {
                        value[t].forEach((itemValue) => {
                            let ui = updateSelected(itemValue);
                            updateUI(ui);
                        });
                    }
                }
            } else {
                let ui = updateSelected(value);
                updateUI(ui);
            }
        } else {
            selectDefault();
        }
    });
    //
    function countOfSelected() {
        let c = 0;
        if (multiple) {
            for (let groupValue of Object.values(variantsSelected)) {
                if (onlyOneInGroup) {
                    if (typeof groupValue !== "undefined") {
                        c++;
                    }
                } else {
                    if (
                        typeof groupValue !== "undefined" &&
                        Array.isArray(groupValue)
                    ) {
                        c += groupValue.length;
                    }
                }
            }
        } else {
            if (
                typeof variantsSelected !== "undefined" &&
                typeof variantsSelected.value !== "undefined" &&
                typeof variantsSelected.group !== "undefined"
            ) {
                c++;
            }
        }
        return c;
    }
    //
    function updateSelected(detail) {
        const { valueId, groupId } = sublimeValue(detail);
        let ui = {
            on: undefined,
            off: undefined,
        };
        //
        if (multiple) {
            if (onlyOneInGroup) {
                if (typeof variantsSelected[groupId] !== "undefined") {
                    ui.off = { groupId, valueId: variantsSelected[groupId] };
                }
                variantsSelected[groupId] = valueId;
                ui.on = { groupId, valueId };
            } else {
                if (!Array.isArray(variantsSelected[groupId])) {
                    variantsSelected[groupId] = [];
                }
                if (variantsSelected[groupId].includes(valueId)) {
                    if (countOfSelected() > 1) {
                        variantsSelected[groupId].splice(
                            variantsSelected[groupId].indexOf(valueId),
                            1
                        );
                        ui.off = { groupId, valueId };
                    }
                } else {
                    variantsSelected[groupId].push(valueId);
                    ui.on = { groupId, valueId };
                }
                variantsSelected[groupId] = variantsSelected[groupId];
            }
            variantsSelected = variantsSelected;
        } else {
            if (
                variantsSelected &&
                variantsSelected.groupId === groupId &&
                variantsSelected.valueId === valueId
            ) {
                if (!atLeastOne) {
                    variantsSelected = undefined;
                    ui.off = { groupId, valueId };
                }
            } else {
                if (variantsSelected) {
                    if (typeof variantsSelected.groupId !== "undefined") {
                        ui.off = {
                            groupId: variantsSelected.groupId,
                            valueId: variantsSelected.valueId,
                        };
                    }
                }
                ui.on = { groupId, valueId };
                variantsSelected = { groupId, valueId };
            }
        }
        return ui;
    }
    //
    function toggle(detail) {
        let ui = updateSelected(detail);
        console.log("image value", value, ui);
        updateUI(ui);
        //
        updateValue();
        //
        dispatch("change", {
            field: fieldname,
            value,
        });
    }
    //
    function updateUI(changes) {
        if (changes.off) {
            uiOff(getItem(changes.off));
        }
        if (changes.on) {
            uiOn(getItem(changes.on));
        }
        variants = variants;
    }
    //
    function updateValue() {
        if (multiple) {
            let newVal = {};
            if (onlyOneInGroup) {
                for (let groupId in variantsSelected) {
                    if (typeof variantsSelected[groupId] !== "undefined") {
                        newVal[groupId] = getItemValue({
                            groupId,
                            valueId: variantsSelected[groupId],
                        });
                    }
                }
            } else {
                for (let groupId in variantsSelected) {
                    if (
                        typeof variantsSelected[groupId] !== "undefined" &&
                        Array.isArray(variantsSelected[groupId])
                    ) {
                        newVal[groupId] = variantsSelected[groupId]
                            .filter((val) => typeof val !== "undefined")
                            .map((itemValueId) => {
                                return getItemValue({
                                    groupId,
                                    valueId: itemValueId,
                                });
                            });
                    }
                }
            }
            if (Object.keys(newVal).length == 0) {
                value = undefined;
            } else {
                value = newVal;
            }
        } else {
            if (variantsSelected) {
                value = getItemValue(variantsSelected);
            } else {
                value = undefined;
            }
        }
    }
    //
    function selectDefault() {
        if (atLeastOne && variants.length > 0) {
            const defValue = getDefaultItemSublime();
            toggle({ id: defValue.valueId, group: defValue.groupId });
        } else {
        }
    }

    const SvelteComponent = $derived(listComponent);
</script>

<SvelteComponent
    {...listComponentProps}
    bind:items={variants}
    {titleComponent}
    {titleComponentProps}
    {descriptionComponent}
    descriptionComponentProps={{
        ...descriptionComponentProps,
        action(event, value) {
            toggle(value);
        },
    }}
    {imageComponent}
    {imageComponentProps}
/>
