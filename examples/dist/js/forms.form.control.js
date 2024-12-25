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
        labelVertical: false
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
    }, {
        UIInput: notBulma.Elements.Inputs.UITextfield,
        validated: true,
        valid: false,
        inputStarted: true,
        required: true,
        pattern: "\\w{3,16}",
        errors: ["error 1", "error 2", "error 3"],
        formErrors: ["form error 1", "form error 2", "form error 3"],
        value: "value",
        label: "text",
        icon: "cross",
        fieldtype: "textfield",
        fieldname: "textfield latest",
        onchange({ field, value }) {
            console.log(field, value);
        }
    }])
}];

window.EXAMPLES.UIFormControl = {
    constructor: "Elements.Forms.UIFormControl",
    list: Examples
};