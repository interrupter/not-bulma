import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "UIPanelSide",
        props: addIndexField([
            {
                class: "has-background-success",
                ...createInnerTextNodeSnippet("UIPanelSide"),
            },
        ]),
    },
];

window.EXAMPLES.UIPanelSide = {
    constructor: "Elements.Layouts.UIPanelSide",
    list: LayoutsExamples,
};
