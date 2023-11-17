<script>
    import { LOCALE } from "../../locale/index";
    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();
    //
    import UIList from "../list/ui.list.svelte";
    import UITitle from "../various/ui.title.svelte";
    import UIImage from "../image/ui.image.svelte";
    import UIButtons from "../button/ui.buttons.svelte";

    export let fieldname = "radio-buttons";
    //

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
    export let value;
    export let title;
    export let image;

    export let buttonProps = {};

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
    export let getUIItem = (valueId) => {
        return variantsButtons.find((btnVal) => btnVal.value === valueId);
    };

    export let getDefaultItemSublime = () => {
        return variants[0].value;
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
        initVariantsButton();
        selectDefault();
    });

    let variantsButtons = [],
        listItems = [];

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
        dispatch("change", {
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
</script>

<svelte:component
    this={listComponent}
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
