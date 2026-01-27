import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "LevelItem",
        props: addIndexField([
            {
                class: "has-background-success",
                ...createInnerTextNodeSnippet("UILevelItem"),
            },
        ]),
    },
];

window.EXAMPLES.UILevelItem = {
    constructor: "Elements.Layouts.UILevelItem",
    list: LayoutsExamples,
};
