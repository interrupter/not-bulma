import {
    createExamplesSetForPropertyNameValues,
    addIndexField,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const SIZES = addIndexField(
    createExamplesSetForPropertyNameValues(
        {},
        ["size", "title"],
        ["small", "default", "normal", "medium", "large"]
    )
);

const ButtonExamples = [
    {
        title: "Simple",
        description: "Simple",
        props: [
            {
                ariaLabel: "Button",
            },
        ],
    },
    {
        title: "Simple - loading",
        description: "Simple - loading",
        props: [
            {
                ariaLabel: "Button",
                loading: true,
            },
        ],
    },

    {
        title: "Sizes",
        description: "Sizes versions",
        props: SIZES,
    },

    {
        title: "onclick",
        description: "Action on click, will toggle element class 'is-inverted'",
        props: [
            {
                color: "warning",
                size: "large",
                value: 42,
                onclick: ({ event, value }) => {
                    event.preventDefault();
                    event.currentTarget.classList.toggle("is-inverted");
                    alert(value);
                    return false;
                },
            },
        ],
    },
];

window.EXAMPLES.UIButtonClose = {
    constructor: "Elements.Buttons.UIButtonClose",
    list: ButtonExamples,
};
