<script>
    import { onMount } from "svelte";
    import UIList from "../list/ui.list.svelte";
    import UITitle from "../various/ui.title.svelte";
    import UIImage from "../image/ui.image.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    //

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
     * @property {any} value - multiple && multiple in group
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
     * @property {any} title
     * @property {any} image
     * @property {any} [buttonProps]
     * @property {any} [titleComponent]
     * @property {any} [titleComponentProps]
     * @property {any} [imageComponent]
     * @property {any} [imageComponentProps]
     * @property {any} [descriptionComponent]
     * @property {any} [descriptionComponentProps]
     * @property {any} [listComponent]
     * @property {any} [listComponentProps]
     * @property {any} [getUIItem]
     * @property {any} [getDefaultItemSublime]
     * @property {any} [uiOn]
     * @property {any} [uiOff]
     */

    /** @type {Props} */
    let {
        fieldname = "radio-buttons",
        variants = [],
        value,
        title,
        image,
        buttonProps = {},
        titleComponent = UITitle,
        titleComponentProps = { size: 5 },
        imageComponent = UIImage,
        imageComponentProps = { covered: true },
        descriptionComponent = UIButtons,
        descriptionComponentProps = {},
        listComponent = UIList,
        listComponentProps = {},
        returnVariant = false,
        getUIItem = (valueId) => {
            return variantsButtons.find((btnVal) => btnVal.value === valueId);
        },
        UIItemHasValue = (item, val) => {
            return item.value == val;
        },
        getDefaultItemSublime = () => {
            return variants[0].value;
        },
        uiOn = (item) => {
            item.color = "success";
            return item;
        },
        uiOff = (item) => {
            item.color = "";
            return item;
        },
        onchange = () => true,
    } = $props();

    onMount(() => {
        initVariantsButton();
        selectDefault();
    });

    let variantsButtons = [],
        listItems = $state([]);

    function initVariantsButton() {
        variantsButtons = variants.map((variant) => {
            return { ...buttonProps, ...variant };
        });
        listItems = [
            {
                id: 0,
                title,
                image,
                description: { values: variantsButtons },
            },
        ];
    }

    const getCurrentVariant = () => {
        const val = $state.snapshot(value);
        return variants.find((va) => va.value === value);
    };

    //
    function toggle(selectedValue) {
        let ui = {
            on: undefined,
            off: undefined,
        };
        //
        if (typeof value !== "undefined") {
            ui.off = value;
        }
        if (typeof selectedValue !== "undefined") {
            ui.on = selectedValue;
        }
        value = selectedValue;
        updateUI(ui);
        //
        onchange({
            field: fieldname,
            value: returnVariant ? getCurrentVariant() : $state.snapshot(value),
        });
    }

    //
    function updateUI(changes) {
        for (let t in variantsButtons) {
            if (
                typeof changes.off !== "undefined" &&
                UIItemHasValue(variantsButtons[t], changes.off)
            ) {
                variantsButtons[t] = uiOff(variantsButtons[t]);
            }
            if (
                typeof changes.on !== "undefined" &&
                UIItemHasValue(variantsButtons[t], changes.on)
            ) {
                variantsButtons[t] = uiOn(variantsButtons[t]);
            }
        }
        listItems[0].description.values = variantsButtons;
    }
    //
    function selectDefault() {
        if (variants.length > 0) {
            if (typeof value === "undefined") {
                const defValue = getDefaultItemSublime();
                toggle(defValue);
            } else {
                updateUI({ on: value });
            }
        }
    }

    const SvelteComponent = $derived(listComponent);
</script>

<SvelteComponent
    {...listComponentProps}
    items={listItems}
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
