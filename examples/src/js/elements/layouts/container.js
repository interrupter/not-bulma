import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "Container",
        props: addIndexField([
            {
                class: "has-background-success",
                ...createInnerTextNodeSnippet("UIContainer"),
            },
        ]),
    },
];

window.EXAMPLES.UIContainer = {
    constructor: "Elements.Layouts.UIContainer",
    list: LayoutsExamples,
};
