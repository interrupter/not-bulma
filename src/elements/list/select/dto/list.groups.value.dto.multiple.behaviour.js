import UICommon from "../../../common.js";

class ListGroupsValueDTOMultipleBehaviour {
    static countItemsInValue(value) {
        if (value) {
            return Object.values(value).reduce((a, b) => (a += b.length), 0);
        } else {
            return 0;
        }
    }

    static initValue(value) {
        return typeof value === "object" &&
            Object.values(value).every(this.groupItemsIsValid)
            ? value
            : {};
    }

    static groupItemsIsValid(groupItems) {
        if (!Array.isArray(groupItems)) {
            return false;
        }
        return groupItems.every((itm) => UICommon.stringOrNumber(itm));
    }

    static itemInValue(value, item) {
        return (
            Object.hasOwn(value, item.groupId) &&
            value[item.groupId].includes(item.valueId)
        );
    }

    static clearFromEmptyGroups(value) {
        Object.keys(value).forEach((key) => {
            if (this.groupIsEmpty(value[key])) {
                delete value[key];
            }
        });
    }

    static groupIsEmpty(group) {
        if (group && Array.isArray(group)) {
            if (group.length === 0) {
                return true;
            }
        } else {
            return true;
        }
        return false;
    }

    static groupIsFull(valueGroup, variantsGroup) {
        return valueGroup.length === variantsGroup?.variants?.length;
    }

    static removeItemFromValue(value, item, options) {
        if (options.atLeastOne && this.countItemsInValue(value) === 1) {
            return;
        }
        value[item.groupId].splice(
            value[item.groupId].indexOf(item.valueId),
            1
        );
        this.clearFromEmptyGroups(value, options);
    }

    /**
     *
     *
     * @static
     * @param {*} value
     * @param {*} item
     * @param {import('../../types.js').ListGroupsOptions} options
     * @memberof ListGroupsValueDTOMultipleBehaviour
     */
    static addItemToValue(value, item, options) {
        if (options.onlyOnePerGroup) {
            value[item.groupId] = [item.valueId];
        } else {
            if (!value[item.groupId] || !Array.isArray(value[item.groupId])) {
                value[item.groupId] = [item.valueId];
            } else {
                if (!value[item.groupId].includes(item.valueId)) {
                    value[item.groupId].push(item.valueId);
                }
            }
        }
    }

    static selectAll(variants, value, options) {
        variants.forEach((variantsGroup) => {
            variantsGroup.variants.forEach((variant) => {
                this.addItemToValue(
                    value,
                    {
                        valueId: variant.id,
                        groupId: variantsGroup.id,
                    },
                    options
                );
            });
        });
    }

    static selectNone(variants, value, options) {
        Object.keys(value).forEach((groupId) => {
            delete value[groupId];
        });
    }

    static selectAllInGroup(variants, value, groupId, options) {
        if (!UICommon.stringOrNumber(groupId)) {
            return;
        }
        const variantsGroup = variants.find((itm) => itm.id == groupId);
        if (
            !variantsGroup ||
            !variantsGroup.variants ||
            !Array.isArray(variantsGroup.variants)
        ) {
            return;
        }
        variantsGroup.variants.forEach((variant) => {
            this.addItemToValue(value, {
                groupId,
                valueId: variant.id,
            });
        });
    }

    static selectNoneInGroup(variants, value, groupId, options) {
        if (value[groupId]) {
            delete value[groupId];
        }
    }

    static valueAsVariants(value, variants) {
        const result = {};
        variants.forEach((group) => {
            if (this.groupIsEmpty(group.id)) return;
            group.variants.forEach((variant) => {
                if (
                    this.itemInValue(value, {
                        groupId: group.id,
                        valueId: variant.id,
                    })
                ) {
                    if (Array.isArray(result[group.id])) {
                        result[group.id].push(variant);
                    } else {
                        result[group.id] = [variant];
                    }
                }
            });
        });
        return result;
    }
}

export default ListGroupsValueDTOMultipleBehaviour;
