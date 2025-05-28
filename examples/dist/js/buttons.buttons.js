import {
    createExamplesSetForPropertyNameValues,
    addIndexField,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const COLORS = addIndexField(
    createExamplesSetForPropertyNameValues(
        {},
        ["title", "color"],
        ["primary", "link", "info", "success", "warning", "danger"]
    )
);

const ButtonsButtonsExamples = [
    {
        title: "Simple group",
        description: "Buttons group",
        props: [
            {
                values: COLORS,
            },
        ],
    },
    {
        title: "Right group",
        description: "Buttons group",
        props: [
            {
                right: true,
                values: COLORS,
            },
        ],
    },
    {
        title: "Centered group",
        description: "Buttons group",
        props: [
            {
                centered: true,
                values: COLORS,
            },
        ],
    },
];
window.EXAMPLES.UIButtons = {
    constructor: "Elements.Buttons.UIButtons",
    list: ButtonsButtonsExamples,
};
