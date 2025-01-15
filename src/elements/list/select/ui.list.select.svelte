<script>
    import { onMount } from "svelte";

    //
    import UIList from "../ui.list.svelte";
    import UITitle from "../../various/ui.title.svelte";
    import UIImage from "../../image/ui.image.svelte";
    import UIButtons from "../../button/ui.buttons.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [fieldname]
     * @property {boolean} [multiple]
     * @property {boolean} [atLeastOne]
     * @property {any} [variants] - array of values variants in group
[
{
id:number,
title:string|object,
description:string|object,
image:string|object,
value:object
}
]
     * @property {any} value - [...selectedItemsValues]
     * @property {any} [selectedVariantsIds] - [...selectedItemsIds]
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
        fieldname = "list-select",
        multiple = false,
        atLeastOne = true,
        variants = $bindable([]),
        value = $bindable(),
        selectedVariantsIds = $bindable([]),
        titleComponent = UITitle,
        titleComponentProps = { size: 5 },
        imageComponent = UIImage,
        imageComponentProps = { covered: true },
        descriptionComponent = UIButtons,
        descriptionComponentProps = {},
        listComponent: UIListComponent = UIList,
        listComponentProps = {},
        sublimeValue = (value) => value.id,
        getItem = ({ valueId }) => {
            return variants.find((btnVal) => btnVal.value.id === valueId);
        },
        getItemValue = ({ valueId }) => {
            return getItem({ valueId }).value;
        },
        getDefaultItemSublime = () => {
            return variants[0].id;
        },
        uiOn = (item) => {
            item.color = "success";
            item.outlined = false;
        },
        uiOff = (item) => {
            item.color = false;
            item.outlined = true;
        },
    } = $props();

    onMount(() => {
        if (value && Array.isArray(value)) {
            if (atLeastOne && value.length) {
                value.forEach((itemValue) => {
                    let ui = updateSelected(itemValue);
                    updateUI(ui);
                });
            }
            return;
        }
        selectDefault();
    });
    //
    function countOfSelected() {
        return Array.isArray(value) ? selectedVariantsIds.length : 0;
    }

    const notLastOne = () => !(atLeastOne && countOfSelected() === 1);
    //
    function updateSelected(detail) {
        const valueId = sublimeValue(detail);
        let ui = {
            on: undefined,
            off: undefined,
        };
        //
        if (!Array.isArray(selectedVariantsIds)) {
            selectedVariantsIds = [];
        }
        if (multiple) {
            if (selectedVariantsIds.includes(valueId)) {
                if (notLastOne()) {
                    selectedVariantsIds.splice(
                        selectedVariantsIds.indexOf(valueId),
                        1
                    );
                    ui.off = { valueId };
                }
            } else {
                selectedVariantsIds.push(valueId);
                ui.on = { valueId };
            }
        } else {
            if (atLeastOne) {
                if (!selectedVariantsIds.includes(valueId)) {
                    if (countOfSelected() > 0) {
                        ui.off = {
                            valueId: selectedVariantsIds.pop(),
                        };
                    }
                    ui.on = {
                        valueId,
                    };
                    selectedVariantsIds = [valueId];
                }
            } else {
                if (selectedVariantsIds.includes(valueId)) {
                    ui.off = {
                        valueId,
                    };
                    selectedVariantsIds.splice(
                        selectedVariantsIds.indexOf(valueId),
                        1
                    );
                } else {
                    ui.on = {
                        valueId,
                    };
                    selectedVariantsIds.push(valueId);
                }
            }
        }
        selectedVariantsIds = selectedVariantsIds;
        return ui;
    }
    //
    function toggle(detail) {
        let ui = updateSelected(detail);
        updateUI(ui);
        //
        updateValue();
        //
        onchange({
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
        let newVal = [];
        if (
            typeof selectedVariantsIds !== "undefined" &&
            Array.isArray(selectedVariantsIds)
        ) {
            newVal = selectedVariantsIds
                .filter((val) => typeof val !== "undefined")
                .map((valueId) =>
                    getItemValue({
                        valueId,
                    })
                );
        }
        value = newVal;
    }
    //
    function selectDefault() {
        if (atLeastOne && variants.length > 0) {
            const defValueId = getDefaultItemSublime();
            toggle({ id: defValueId });
        }
    }
</script>

<UIListComponent
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
