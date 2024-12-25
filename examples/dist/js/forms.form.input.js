/* global notBulma */
if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}
import { addIndexField } from "./examples.helpers.js";

const Examples = [{
    title: "Варианты",
    props: addIndexField([{
        UIInput: notBulma.Elements.Inputs.UITextfield,
        validated: false,
        valid: true,
        value: "",
        required: false
    }, {
        UIInput: notBulma.Elements.Inputs.UITextfield,
        validated: true,
        valid: true,
        value: "",
        label: "invalid if empty",
        fieldtype: "textfield",
        fieldname: "textfield",
        vertical: false
    }, {
        UIInput: notBulma.Elements.Inputs.UITextfield,
        validated: true,
        valid: true,
        disabled: true,
        value: "some disabled value",
        label: "text",
        fieldtype: "textfield",
        fieldname: "textfield"
    }, {
        UIInput: notBulma.Elements.Inputs.UITextfield,
        validated: false,
        valid: true,
        value: "readonly value",
        label: "text",
        fieldtype: "textfield",
        fieldname: "textfield",
        readonly: true
    }])
}];

window.EXAMPLES.UIFormInput = {
    constructor: "Elements.Forms.UIFormInput",
    list: Examples
};