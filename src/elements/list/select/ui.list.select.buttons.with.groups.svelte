<script>
    import { onMount } from "svelte";

    //
    import UIList from "../ui.list.svelte";
    import UITitle from "../../various/ui.title.svelte";
    import UIImage from "../../image/ui.image.svelte";
    import UIButtons from "../../button/ui.buttons.svelte";
    import UIButtonsSwitchers from "../../button/ui.buttons.switchers.svelte";

    import ListGroupsUITreeDTO from "./dto/list.groups.ui.tree.dto.js";
    import ListGroupsValueDTO from "./dto/list.groups.value.dto.js";

    /**
     * @typedef {Object} Props
     * @property {function} [onchange]  callback on value change event
     * @property {string} [fieldname="list-select-tags"]
     * @property {import('../types').VariantsGroups} [variants = []] -
     * @property {import('../types').SelectedValues} [variantsSelected = {}] - multiple && multiple in group
     * @property {import('../types').SelectedVariants} [value = []]
     * @property {object} [behaviourUI = ListGroupsUITreeDTO]
     * @property {object} [behaviourValue = ListGroupsValueDTO]
     * @property {boolean} [multiple = true]
     * @property {boolean} [onlyOnePerGroup = true]
     * @property {boolean} [atLeastOne = true]
     * @property {function} [titleComponent = UITitle]
     * @property {object} [titleComponentProps = { size: 5}]
     * @property {function} [imageComponent = UIImage]
     * @property {object} [imageComponentProps = { covered: true }]
     * @property {function} [descriptionComponent = UIButtonsSwitchers]
     * @property {object} [descriptionComponentProps = {}]
     * @property {function} [listComponent = UIList]
     * @property {object} [listComponentProps = {}]
     * @property {Array<string>} [actionsList=["selectAll", "selectNone"]]
     */

    /** @type {Props} */
    let {
        onchange = () => true,
        fieldname = "list-select-tags",
        variants = [],
        variantsSelected = {},
        value,
        //behaviour managers
        behaviourUI = ListGroupsUITreeDTO,
        behaviourValue = ListGroupsValueDTO,
        //behaviour options
        multiple = true,
        onlyOnePerGroup = true,
        atLeastOne = true,
        //comopnents, renderers and props for them
        titleComponent = UITitle,
        titleComponentProps = { size: 5 },
        imageComponent = UIImage,
        imageComponentProps = { covered: true },
        descriptionComponent = UIButtonsSwitchers,
        descriptionComponentProps = {},
        listComponent: UIListComponent = UIList,
        listComponentProps = {},
        actionsList = ["selectAll", "selectNone"],
    } = $props();

    //

    const AVAILABLE_ACTIONS = {
        selectAll: {
            title: "Выбрать все",
            color: "success",
            action() {
                selectAll();
            },
        },
        selectNone: {
            title: "Снять выделение со всех",
            color: "",
            action() {
                selectNone();
            },
        },
    };

    let ACTIONS = $state([]);
    let selectorGroups = $state([]);

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

    export const valueAsVariants = () =>
        behaviourValue.valueAsVariants(value, variants);

    function triggerChange() {
        variantsSelected = valueAsVariants();
        onchange({
            field: fieldname,
            value,
        });
    }

    onMount(() => {
        actionsList.forEach((name) => {
            Object.hasOwn(AVAILABLE_ACTIONS, name)
                ? ACTIONS.push(AVAILABLE_ACTIONS[name])
                : false;
        });
        ACTIONS = ACTIONS;
        selectorGroups = behaviourUI.buildSelectorItemsFromVariants(variants);
        value = behaviourValue.initValue(value, { multiple });
        updateUI();
    });

    export const selectAll = () => {
        behaviourValue.selectAll(variants, value, {
            multiple,
            onlyOnePerGroup,
            atLeastOne,
        });
        updateUI();
        triggerChange();
    };

    export const selectNone = () => {
        behaviourValue.selectNone(variants, value, {
            multiple,
            onlyOnePerGroup,
            atLeastOne,
        });
        updateUI();
        triggerChange();
    };

    export const selectAllInGroup = (groupId) => {
        behaviourValue.selectAllInGroup(variants, value, groupId, {
            multiple,
            onlyOnePerGroup,
            atLeastOne,
        });
        updateUI();
        triggerChange();
    };

    export const selectNoneInGroup = (groupId) => {
        behaviour.selectNoneInGroup(variants, value, groupId, {
            multiple,
            onlyOnePerGroup,
            atLeastOne,
        });
        updateUI();
        triggerChange();
    };

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

<UIButtons values={ACTIONS} centered={true} />

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
