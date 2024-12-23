import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "Footer",
        props: addIndexField([
            {
                class: "has-background-success",
                ...createInnerTextNodeSnippet("Footer"),
            },
        ]),
    },
];

window.EXAMPLES.UIFooter = {
    constructor: "Elements.Layouts.UIFooter",
    list: LayoutsExamples,
};
