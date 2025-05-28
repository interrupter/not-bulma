import UICommon from "../../../common.js";

/**
 * Collection of static methods to work with SelectorGroups objects
 *
 * @class ListGroupsUITreeDTO
 */
class ListGroupsUITreeDTO {
    static UI_PROPS_DELTA_ON = {
        class: "has-background-success",
    };

    static UI_PROPS_DELTA_OFF = {
        class: "",
    };

    static UI_PROPS_DELTA_ON_ACTION = {
        title: "not-node:booleans_true",
        color: "success",
    };

    static UI_PROPS_DELTA_OFF_ACTION = {
        title: "not-node:booleans_false",
        color: "danger",
    };
    /**
     *
     * Returns title field from object as string
     * @static
     * @param {Object}  val
     * @param {string}  val.title
     * @return {string}
     * @memberof ListGroupsUITreeDTO
     */
    static convertGroupTitle({ title }) {
        return title;
    } //refactored

    /**
     *
     * Returns image field from object as string
     * @static
     * @param {Object}  val
     * @param {string}  val.image
     * @return {string}
     * @memberof ListGroupsUITreeDTO
     */

    static convertGroupImage({ image }) {
        return image;
    } //refactored

    /**
     * Converts variant object to selector item object
     *
     * @static
     * @param {import('../../types.js').Variant} variant
     * @return {import('../../types.js').SelectorItem}
     * @memberof ListGroupsUITreeDTO
     */
    static convertVariant(variant, groupId) {
        return {
            id: variant.id,
            title: variant.title,
            value: { valueId: variant.id, groupId }, //what we will sublime
        };
    } //refactored

    /**
     *
     *
     * @static
     * @param {import('../../types.js').VariantsGroup} group
     * @return {import('../../types.js').SelectorGroup}
     * @memberof ListGroupsUITreeDTO
     */
    static convertVariantsGroup(group) {
        return {
            id: group.id,
            title: this.convertGroupTitle(group),
            image: this.convertGroupImage(group),
            description: {
                values: group.variants.map((itm) =>
                    this.convertVariant(itm, group.id)
                ),
            },
        };
    } //refactored

    /**
     *
     *
     * @static
     * @param {import('../../types.js').VariantsGroups} variants
     * @return {import('../../types.js').SelectorGroups}
     * @memberof ListGroupsUITreeDTO
     */
    static buildSelectorItemsFromVariants(variants) {
        return variants.map((itm) => this.convertVariantsGroup(itm));
    } //refactored

    /**
     *
     * Returns {group: number, id: number} as SelectedVariant type {groupId: string|number, valueId: string|number}
     * @static
     * @param   {object} value
     * @return  {import('../../types.js').SelectedVariant}
     * @memberof ListGroupsUITreeDTO
     */
    static sublimeValue(value) {
        return {
            groupId: value.group || value.groupId,
            valueId: value.id || value.valueId,
        };
    } //refactored

    /**
     * Returns index of group in array by groupId or undefined if its not found
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @param {number} groupId
     * @static
     * @returns {number|undefined}
     * @memberof ListGroupsUITreeDTO
     */
    static getSelectorGroupIndex(selectorGroupsItems, groupId) {
        const index = selectorGroupsItems.findIndex(
            (group) => group.id === groupId
        );
        return index > -1 ? index : undefined;
    } //refactored

    /**
     *
     * @static
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @param {number} index
     * @return {import('../../types.js').SelectorGroup}
     * @memberof ListGroupsUITreeDTO
     */
    static getSelectorGroup(selectorGroupsItems, index) {
        return selectorGroupsItems[index];
    } //refactored

    /**
     *
     * @static
     * @param {import('../../types.js').SelectorGroup} group
     * @return {boolean}
     * @memberof ListGroupsUITreeDTO
     */
    static selectorGroupHasVariants(group) {
        return (
            group &&
            group.description &&
            Array.isArray(group.description.values)
        );
    } //refactored

    /**
     *
     *
     * @param {import('../../types.js').SelectorGroup} group
     * @return {import("../../types.js").SelectorItems}
     * @memberof ListGroupsUITreeDTO
     */
    static getSelectorGroupVariants(group) {
        return group.description.values;
    }

    /**
     * Returns comparation function, (val: SelectorItem)=>boolean,
     * which checks if val has specified variantId
     *
     * @static
     * @param {import('../../types.js').VariantId} variantId
     * @return {function}
     * @memberof ListGroupsUITreeDTO
     */
    static compareSelectorGroupValueIdWith(variantId) {
        return (val) => val?.value?.valueId === variantId;
    } //refactored

    /**
     * Returns index of item in group by groupIndex and item valueId or undefined if its not found
     * @static
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @param {number} groupIndex
     * @param {import('../../types.js').VariantId} valueId
     * @returns {number|undefined}
     * @memberof ListGroupsUITreeDTO
     */
    static getSelectorItemIndex(selectorGroupsItems, groupIndex, valueId) {
        const group = this.getSelectorGroup(selectorGroupsItems, groupIndex);
        if (!this.selectorGroupHasVariants(group)) {
            return undefined;
        }
        const itemIndex = this.getSelectorGroupVariants(group).findIndex(
            this.compareSelectorGroupValueIdWith(valueId)
        );
        return itemIndex > -1 ? itemIndex : undefined;
    } //refactored

    /**
     * Returns {groupIndex: number, itemIndex: number} or undefined from VariantsGroups by groupId, valueId
     *
     * @static
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @param {import('../../types.js').VariantId} groupId
     * @param {import('../../types.js').VariantId} valueId
     * @return {import('../../types.js').ItemIndexes | undefined}
     * @memberof ListGroupsUITreeDTO
     */
    static getSelectorItemIndexes(selectorGroupsItems, groupId, valueId) {
        const groupIndex = this.getSelectorGroupIndex(
            selectorGroupsItems,
            groupId
        );
        if (groupIndex === -1 || typeof groupIndex === "undefined") {
            return undefined;
        }
        const itemIndex = this.getSelectorItemIndex(
            selectorGroupsItems,
            groupIndex,
            valueId
        );
        if (itemIndex === -1 || typeof itemIndex === "undefined") {
            return undefined;
        }
        return {
            groupIndex,
            itemIndex,
        };
    } //refactored

    /**
     *
     *
     * @static
     * @param {import('../../types.js').SelectorGroups}   selectorGroupsItems
     * @param {import('../../types.js').ItemIds}       itemIds
     * @return {import('../../types.js').SelectorItem}
     * @memberof ListGroupsUITreeDTO
     */
    static getSelectorItem(selectorGroupsItems, itemIds) {
        /** @type {import('../../types.js').ItemIndexes | undefined} */
        const indexes = this.getSelectorItemIndexes(
            selectorGroupsItems,
            itemIds.groupId,
            itemIds.valueId
        );
        if (indexes) {
            const group = this.getSelectorGroup(
                selectorGroupsItems,
                indexes.groupIndex
            );
            if (!this.selectorGroupHasVariants(group)) {
                return undefined;
            }
            const groupVariants = this.getSelectorGroupVariants(group);
            return groupVariants[indexes.itemIndex];
        }
        return undefined;
    } //refactored

    /**
     *
     *
     * @static
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @return {import('../../types.js').SelectedVariant | undefined}
     * @memberof UIListSelectWithGroupsBehaviour
     */
    static getDefaultSelectorItemSublime(selectorGroupsItems) {
        if (
            selectorGroupsItems &&
            selectorGroupsItems.length &&
            this.selectorGroupHasVariants(selectorGroupsItems[0])
        ) {
            const groupId = selectorGroupsItems[0].id;
            const valueId =
                selectorGroupsItems[0].description.values[0]?.value?.valueId;
            if (UICommon.stringsOfNumbers([groupId, valueId])) {
                return {
                    groupId,
                    valueId,
                };
            }
        }
        return undefined;
    } //refactored

    /**
     * Changes selector items
     *
     * @static
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @param {import('../../types.js').ItemIds} itemIds
     * @param {object} itemProps
     * @param {object} actionsUIProps
     * @return {undefined}
     * @memberof UIListSelectWithGroupsBehaviour
     */
    static updateSelectorItem(
        selectorGroupsItems,
        itemIds,
        itemProps,
        actionsUIProps
    ) {
        const indexes = this.getSelectorItemIndexes(
            selectorGroupsItems,
            itemIds.groupId,
            itemIds.valueId
        );
        if (typeof indexes === "undefined") {
            return;
        }
        Object.keys(itemProps).forEach((key) => {
            selectorGroupsItems[indexes.groupIndex].description.values[
                indexes.itemIndex
            ][key] = itemProps[key];
        });
        if (
            Array.isArray(
                selectorGroupsItems[indexes.groupIndex].description.values[
                    indexes.itemIndex
                ].actions
            ) &&
            selectorGroupsItems[indexes.groupIndex].description.values[
                indexes.itemIndex
            ].actions.length
        ) {
            Object.keys(uiProps).forEach((key) => {
                selectorGroupsItems[indexes.groupIndex].description.values[
                    indexes.itemIndex
                ][0][key] = actionsUIProps[key];
            });
        }
    } //refactored

    /**
     *
     *
     * @static
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @param {import('../../types.js').ItemIds}   itemIds
     * @memberof UIListSelectWithGroupsBehaviour
     */
    static uiOn(selectorGroupsItems, itemIds) {
        this.updateSelectorItem(
            selectorGroupsItems,
            itemIds,
            {
                ...this.UI_PROPS_DELTA_ON,
            },
            { ...this.UI_PROPS_DELTA_ON_ACTION }
        );
    } //refactored

    /**
     *
     *
     * @static
     * @param {import('../../types.js').SelectorGroups} selectorGroupsItems
     * @param {import('../../types.js').ItemIds}   itemIds
     * @memberof UIListSelectWithGroupsBehaviour
     */
    static uiOff(selectorGroupsItems, itemIds) {
        this.updateSelectorItem(
            selectorGroupsItems,
            itemIds,
            {
                ...this.UI_PROPS_DELTA_OFF,
            },
            { ...this.UI_PROPS_DELTA_OFF_ACTION }
        );
    } //refactored

    static syncUIWithValue(selectorGroups, itemInValue) {
        for (const group of selectorGroups) {
            const items = this.getSelectorGroupVariants(group);
            for (const item of items) {
                const itemIds = {
                    groupId: group.id,
                    valueId: item.id,
                };
                if (itemInValue(itemIds)) {
                    this.uiOn(selectorGroups, itemIds);
                } else {
                    this.uiOff(selectorGroups, itemIds);
                }
            }
        }
        return selectorGroups;
    }
}

export default ListGroupsUITreeDTO;
