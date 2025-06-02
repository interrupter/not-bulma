import UICommon from "../../../common.js";

import ListGroupsValueDTOMultipleBehaviour from "./list.groups.value.dto.multiple.behaviour.js";
import ListGroupsValueDTOSingleBehaviour from "./list.groups.value.dto.single.behaviour.js";

class ListGroupsValueDTO {
    static behaviour(options) {
        return options.multiple
            ? ListGroupsValueDTOMultipleBehaviour
            : ListGroupsValueDTOSingleBehaviour;
    }

    static initValue(value, options) {
        return this.behaviour(options).initValue(value);
    }

    static itemInValue(value, item, options) {
        return this.behaviour(options).itemInValue(value, item, options);
    }

    /**
     *
     *
     * @static
     * @param {import('../../types.js').SelectedValues} value
     * @param {Object} item
     * @param {ListGroupsOptions} options
     * @memberof ListGroupsValueDTO
     */
    static toggle(value, item, options) {
        if (this.itemInValue(value, item, options)) {
            this.removeItemFromValue(value, item, options);
        } else {
            this.addItemToValue(value, item, options);
        }
    }

    static removeItemFromValue(value, item, options) {
        this.behaviour(options).removeItemFromValue(value, item, options);
    }

    static addItemToValue(value, item, options) {
        this.behaviour(options).addItemToValue(value, item, options);
    }

    static selectAll(variants, value, options) {
        this.behaviour(options).selectAll(variants, value, options);
    }

    static selectNone(variants, value, options) {
        this.behaviour(options).selectNone(variants, value, options);
    }

    static selectAllInGroup(variants, value, groupId, options) {
        this.behaviour(options).selectAllInGroup(
            variants,
            value,
            groupId,
            options
        );
    }

    static selectNoneInGroup(variants, value, groupId, options) {
        this.behaviour(options).selectNoneInGroup(
            variants,
            value,
            groupId,
            options
        );
    }

    static valueAsVariants(value, variants) {
        return this.behaviour(options).valueAsVariants(value, variants);
    }
}

export default ListGroupsValueDTO;
