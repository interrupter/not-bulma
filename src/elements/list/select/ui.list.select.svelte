<script>
    import { onMount } from "svelte";

    //
    import UIList from "../ui.list.svelte";
    import UITitle from "../../various/ui.title.svelte";
    import UIImage from "../../image/ui.image.svelte";
    import UIButtons from "../../button/ui.buttons.svelte";

    /**
     * @typedef {Object} Props
     * @property {string}       [fieldname = "list-select"]                             field name
     * @property {boolean}      [multiple = false]                                      if want not one variant selected
     * @property {boolean}      [atLeastOne = true]                                     no empty result
     * @property {array<import('./types.js').VariantInGroup>} [variants = []]           variants to select from
     * @property {array<object>} value                                                  [...selectedItemsValues]
     * @property {array<string|number>} [selectedVariantsIds = []]                      [...selectedItemsIds]
     * @property {function}     [titleComponent = UITitle]
     * @property {object}       [titleComponentProps= { size: 5 }]
     * @property {function}     [imageComponent = UIImage]
     * @property {object}       [imageComponentProps= { covered: true }]
     * @property {function}     [listComponent = UIList]
     * @property {object}       [listComponentProps = {actionsVisible: true}]
     * @property {function}     [sublimeValue = (value) => value.id]
     * @property {function}     [updateVariant = (valueId, props, toggleTitle) => void]
     * @property {function}     [getItemIndex = (items, valueId) => number]
     * @property {function}     [getItem = (items, { valueId }) => object]
     * @property {function}     [getItemValue = (items, { valueId }) => object]
     * @property {function}     [getDefaultItemSublime = (items) => string]
     * @property {function}     [updateVariant = (items, valueId, props, toggleTitle) => void]
     * @property {function}     [uiOn = (items, { valueId }) => void]
     * @property {function}     [uiOff = (items, { valueId }) => void]
     * @property {function}     [extendVariantToItemList = (item) => object]
     */
    let items = $state([]);
    /** @type {Props} */
    let {
        fieldname = "list-select",
        multiple = false,
        atLeastOne = true,
        variants = [], //variants to select from
        value = [], //selected objects
        selectedVariantsIds = [], //only ids of selected variants
        titleComponentProps = { size: 5 },
        imageComponent = UIImage,
        imageComponentProps = { covered: true },
        listComponent: UIListComponent = UIList,
        listComponentProps = { actionsVisible: true },
        sublimeValue = (value) => value.id, //object -> id
        getItemIndex = (items, valueId) =>
            items.findIndex((val) => val.value.id === valueId),
        getItem = (items, { valueId }) => {
            //returns variants by its id
            return items.find((btnVal) => btnVal.value.id === valueId);
        },
        getItemValue = (items, { valueId }) => {
            // returns variant's value by id of variant
            return getItem(items, { valueId }).value;
        },
        getDefaultItemSublime = (items) => {
            return items && items.length ? items[0].id : undefined;
        },
        updateVariant = (items, valueId, itemProps, buttonProps) => {
            const index = getItemIndex(items, valueId);
            if (index === -1) {
                return;
            }
            Object.keys(itemProps).forEach((key) => {
                items[index][key] = itemProps[key];
            });
            if (
                Array.isArray(items[index].actions) &&
                items[index].actions.length
            ) {
                Object.keys(buttonProps).forEach((key) => {
                    items[index].actions[0][key] = buttonProps[key];
                });
            }
        },
        uiOn = (items, { valueId }) => {
            updateVariant(
                items,
                valueId,
                {
                    class: "has-background-success",
                },
                { title: "not-node:booleans_true", color: "success" }
            );
        },
        uiOff = (items, { valueId }) => {
            updateVariant(
                items,
                valueId,
                {
                    class: "",
                },
                { title: "not-node:booleans_false", color: "danger" }
            );
        },
        extendVariantToItemList = (itm) => {
            const res = { ...itm };
            res.actions = [
                {
                    title: "not-node:booleans_false",
                    color: "danger",
                    light: true,
                    action: toggle,
                },
            ];
            return res;
        },
        onchange,
        ...others
    } = $props();

    onMount(() => {
        items = variants.map(extendVariantToItemList);
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
            value: $state.snapshot(value),
            ids: $state.snapshot(selectedVariantsIds),
        });
    }
    //
    function updateUI(changes) {
        if (changes.off) {
            uiOff(items, changes.off);
        }
        if (changes.on) {
            uiOn(items, changes.on);
        }
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
                    getItemValue(items, {
                        valueId,
                    })
                );
        }
        value = newVal;
    }
    //
    function selectDefault() {
        if (atLeastOne && items.length > 0) {
            const defValueId = getDefaultItemSublime(items);
            if (defValueId) {
                toggle({ id: defValueId });
            }
        }
    }
</script>

<UIListComponent
    {titleComponentProps}
    {imageComponent}
    {imageComponentProps}
    {...others}
    {...listComponentProps}
    {items}
/>
