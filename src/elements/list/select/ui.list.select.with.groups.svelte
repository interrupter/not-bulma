<script>
    import { onMount } from "svelte";

    //
    import UIList from "../ui.list.svelte";
    import UITitle from "../../various/ui.title.svelte";
    import UIImage from "../../image/ui.image.svelte";
    import UIButtons from "../../button/ui.buttons.svelte";

    import ListGroupsUITreeDTO from "./dto/list.groups.ui.tree.dto.js";
    import ListGroupsValueDTO from "./dto/list.groups.value.dto.js";

    /**
     * @typedef {Object} Props
     * @property {string}       [fieldname = "list-select"]                             field name
     * @property {function}     [onchange]  callback on value change event
     * @property {array<import('./types.js').VariantsGroups>}   [variants = []]           variants to select from
     * @property {array<import('./types.js').SelectedValues}  [variantsSelected] - multiple && multiple in group
     * @property {array<import('./types.js').SelectedVariants}  value - {[groupId]: [...valuesOfSelectedItems]}
     * @property {object}       [behaviourUI = ListGroupsUITreeDTO]
     * @property {object}       [behaviourValue = ListGroupsValueDTO]
     * @property {boolean}      [multiple = false]                                      if want not one variant selected
     * @property {boolean}      [onlyOnePerGroup = true]
     * @property {boolean}      [atLeastOne = true]                                     no empty result
     * @property {function}     [titleComponent = UITitle]
     * @property {object}       [titleComponentProps= { size: 5 }]
     * @property {function}     [imageComponent = UIImage]
     * @property {object}       [imageComponentProps= { covered: true }]
     * @property {function}     [descriptionComponent = UIButtons]
     * @property {object}       [descriptionComponentProps = {}]
     * @property {function}     [listComponent = UIList]
     * @property {object}       [listComponentProps = {}]
     */

    let selectorGroups = $state([]);
    /** @type {Props} */
    let {
        onchange = () => true,
        fieldname = "list-select-tags",
        variants = [],
        variantsSelected = {},
        value,
        behaviourUI = ListGroupsUITreeDTO,
        behaviourValue = ListGroupsValueDTO,
        multiple = false,
        onlyOnePerGroup = true,
        atLeastOne = true,

        titleComponent = UITitle,
        titleComponentProps = { size: 5 },
        imageComponent = UIImage,
        imageComponentProps = { covered: true },
        descriptionComponent = UIButtons,
        descriptionComponentProps = {},
        listComponent: UIListComponent = UIList,
        listComponentProps = {},
    } = $props();

    function updateUI() {
        selectorGroups = behaviourUI.syncUIWithValue(
            selectorGroups,
            (itemIds) =>
                behaviourValue.itemInValue(value, itemIds, {
                    multiple,
                    onlyOnePerGroup,
                    atLeastOne,
                })
        );
    }

    onMount(() => {
        selectorGroups = behaviourUI.buildSelectorItemsFromVariants(variants);
        value = behaviourValue.initValue(value, {
            multiple,
            onlyOnePerGroup,
            atLeastOne,
        });
        updateUI();
    });

    export const valueAsVariants = () =>
        behaviourValue.valueAsVariants(value, variants);

    function triggerChange() {
        variantsSelected = valueAsVariants();
        onchange({
            field: fieldname,
            value,
        });
    }

    export const toggleItem = (itemValue) => {
        behaviourValue.toggle(value, itemValue, {
            multiple,
            onlyOnePerGroup,
            atLeastOne,
        });

        updateUI();

        triggerChange();
    };
</script>

<UIListComponent
    {...listComponentProps}
    {titleComponent}
    {titleComponentProps}
    {descriptionComponent}
    descriptionComponentProps={{
        action(event, itemValue) {
            toggleItem(itemValue);
        },
        ...descriptionComponentProps,
    }}
    {imageComponent}
    {imageComponentProps}
    items={selectorGroups}
/>
