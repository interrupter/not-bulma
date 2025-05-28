import UICommon from "../../../common.js";

class ListGroupsValueDTOSingleBehaviour {
    static countItemsInValue(value) {
        return value &&
            UICommon.stringsOfNumbers([value.valueId, value.groupId])
            ? 1
            : 0;
    }

    static initValue(value) {
        return value &&
            UICommon.stringsOfNumbers([value.valueId, value.groupId])
            ? value
            : { valueId: undefined, groupId: undefined };
    }

    static itemInValue(value, item) {
        return (
            Object.hasOwn(value, "groupId") &&
            Object.hasOwn(value, "valueId") &&
            UICommon.stringsOfNumbers([value.valueId, value.groupId]) &&
            value.groupId == item.groupId &&
            value.valueId == item.valueId
        );
    }

    /**
     *
     *
     * @static
     * @param {*} value
     * @param {*} item
     * @param {import('../../types.js').ListGroupsOptions} options
     * @memberof ListGroupsValueDTOSingleBehaviour
     */
    static removeItemFromValue(value, item, options) {
        if (!options.atLeastOne) {
            value[item.groupId].splice(
                value[item.groupId].indexOf(item.valueId),
                1
            );
        }
    }

    static addItemToValue(value, item) {
        if (typeof value === "undefined") {
            value = this.initValue();
        }
        value.valueId = item.valueId;
        value.groupId = item.groupId;
    }

    static valueAsVariants(value, variants) {
        if (this.countItemsInValue(value)) {
            return variants
                .find((group) => group.id === value.groupId)
                .variants.find((variant) => variant.id === value.valueId);
        } else {
            return {};
        }
    }
}

export default ListGroupsValueDTOSingleBehaviour;
