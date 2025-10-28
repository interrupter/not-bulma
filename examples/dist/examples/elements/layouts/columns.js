import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "Columns of different sizes",
        props: addIndexField([
            {
                class: "has-background-light",
                title: "Columns",
                ...createInnerTextNodeSnippet("Columns"),
            },
        ]),
    },
];

window.EXAMPLES.UIColumns = {
    constructor: "Elements.Layouts.UIColumns",
    list: LayoutsExamples,
};
