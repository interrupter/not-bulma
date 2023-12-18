<script>
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    //
    import UIList from "./ui.list.svelte";
    import UITitle from "../various/ui.title.svelte";
    import UIImage from "../image/ui.image.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    export let fieldname = "list-select";
    export let multiple = false;
    export let atLeastOne = true;

    /*
    //array of values variants in group
    [
        {         
            id:number,
            title:string|object,
            description:string|object,
            image:string|object,
            value:object
        }
    ]
    */
    export let variants = [];
    //[...selectedItemsValues]
    export let value;
    //[...selectedItemsIds]
    export let selectedVariantsIds = [];
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
    export let sublimeValue = (value) => value.id;

    //
    export let getItem = ({ valueId }) => {
        return variants.find((btnVal) => btnVal.value.id === valueId);
    };

    export let getItemValue = ({ valueId }) => {
        return getItem({ valueId }).value;
    };

    export let getDefaultItemSublime = () => {
        return variants[0].id;
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
