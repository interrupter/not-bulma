<script>
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    //
    import UIList from "./ui.list.svelte";
    import UITitle from "../various/ui.title.svelte";
    import UIImage from "../image/ui.image.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    export let fieldname = "list-select-tags";
    export let multiple = false;
    export let onlyOneInGroup = true;
    export let atLeastOne = true;

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
    export let descriptionComponent = UIButtons;
    export let descriptionComponentProps = {};
    //
    export let listComponent = UIList;
    export let listComponentProps = {};
    //
    export let sublimeValue = (value) => {
        return {
            groupId: value.group,
            valueId: value.id,
        };
    };
    //
    export let getItem = ({ groupId, valueId }) => {
        return variants
            .find((group) => group.id === groupId)
            .description.values.find((btnVal) => btnVal.value.id === valueId);
    };
    export let getItemValue = ({ groupId, valueId }) => {
        return getItem({ groupId, valueId }).value;
    };
    export let getDefaultItemSublime = () => {
        return {
            groupId: variants[0].id,
            valueId: variants[0].description.values[0].value.id,
        };
    };
    //
    export let uiOn = (item) => {
        item.color = "success";
        item.outlined = false;
    };
    export let uiOff = (item) => {
        item.color = false;
        item.outlined = true;
    };

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
</script>

<svelte:component
    this={listComponent}
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
