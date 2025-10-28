import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "Section",
        props: addIndexField([
            {
                class: "has-background-success",
                ...createInnerTextNodeSnippet("Section"),
            },
        ]),
    },
];

window.EXAMPLES.UISection = {
    constructor: "Elements.Layouts.UISection",
    list: LayoutsExamples,
};
