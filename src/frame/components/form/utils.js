import notCommon from "../../common";

import { FIELDS, COMPONENTS, VARIANTS } from "../../LIB.js";

class notFormUtils {
    static validator = null;

    static addComponent(name, value) {
        COMPONENTS.add(name, value);
    }

    static addVariants(name, value) {
        VARIANTS.add(name, value);
    }

    static addField(name, field) {
        FIELDS.add(name, field);
    }

    static actionFieldsInit(fieldName, options, data) {
        if (Array.isArray(fieldName)) {
            fieldName.forEach((subFieldName) => {
                this.actionFieldsInit(subFieldName, options, data);
            });
        } else {
            if (!notCommon.objHas(options, "fields")) {
                options.fields = {};
            }
            if (!notCommon.objHas(options.fields, fieldName)) {
                options.fields[fieldName] = {};
            }
            //copying initial data
            if (
                typeof data !== "undefined" &&
                data !== null &&
                typeof data[fieldName] !== "undefined" &&
                data[fieldName] !== null
            ) {
                options.fields[fieldName].value = data[fieldName];
            }
        }
    }
}

export default notFormUtils;
