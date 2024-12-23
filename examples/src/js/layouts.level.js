import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "UILevel",
        props: addIndexField([
            {
                class: "has-background-success",
                ...createInnerTextNodeSnippet("UILevel"),
            },
        ]),
    },
];

window.EXAMPLES.UILevel = {
    constructor: "Elements.Layouts.UILevel",
    list: LayoutsExamples,
};
