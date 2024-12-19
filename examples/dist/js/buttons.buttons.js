import { createExamplesSetForPropertyNameValues, addIndexField } from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const COLORS = addIndexField(createExamplesSetForPropertyNameValues({}, ["title", "color"], ["primary", "link", "info", "success", "warning", "danger"]));

const ButtonsExamples = [{
    title: "Simple group",
    description: "Buttons group",
    props: [{
        values: COLORS
    }]
}, {
    title: "Right group",
    description: "Buttons group",
    props: [{
        right: true,
        values: COLORS
    }]
}, {
    title: "Centered group",
    description: "Buttons group",
    props: [{
        centered: true,
        values: COLORS
    }]
}];
window.EXAMPLES.UIButtonsGroups = {
    constructor: "Elements.Buttons.UIButtons",
    list: ButtonsExamples
};