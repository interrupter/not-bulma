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
        value = $bindable(),
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
        getUIItem = (valueId) => {
            return variantsButtons.find((btnVal) => btnVal.value === valueId);
        },
        getDefaultItemSublime = () => {
            return variants[0].value;
        },
        uiOn = (item) => {
            item.color = "success";
            item.outlined = false;
        },
        uiOff = (item) => {
            item.color = false;
            item.outlined = true;
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

    //
    function toggle(selectedValue) {
        let ui = {
            on: undefined,
            off: undefined,
        };
        //
        if (value) {
            ui.off = value;
            ui.on = selectedValue;
        }
        value = selectedValue;
        updateUI(ui);
        //
        onchange({
            field: fieldname,
            value,
        });
    }
    //
    function updateUI(changes) {
        if (changes.off) {
            uiOff(getUIItem(changes.off));
        }
        if (changes.on) {
            uiOn(getUIItem(changes.on));
        }
        variantsButtons = variantsButtons;
        listItems = listItems;
    }
    //
    function selectDefault() {
        if (variants.length > 0) {
            if (typeof value !== "undefined") {
                updateUI({ on: value });
            } else {
                const defValue = getDefaultItemSublime();
                toggle(defValue);
            }
        }
    }

    const SvelteComponent = $derived(listComponent);
</script>

<SvelteComponent
    {...listComponentProps}
    bind:items={listItems}
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
