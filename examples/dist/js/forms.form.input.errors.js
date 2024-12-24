if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}
import { addIndexField } from "./examples.helpers.js";

const Examples = [{
    title: "Варианты",
    props: addIndexField([{
        inputStarted: false,
        validated: false,
        errors: [],
        formErrors: []
    }, {
        inputStarted: true,
        validated: false,
        errors: [],
        formErrors: []
    }, {
        inputStarted: true,
        validated: true,
        valid: true,
        errors: ["error 1"],
        formErrors: ["form error 1"]
    }, {
        inputStarted: true,
        validated: true,
        valid: false,
        errors: ["error 2"],
        formErrors: ["form error 2"]
    }])
}];

window.EXAMPLES.UIFormInputErrors = {
    constructor: "Elements.Forms.UIFormInputErrors",
    list: Examples
};