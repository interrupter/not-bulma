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

const COLORS_LIGHT = addIndexField(
    createExamplesSetForPropertyNameValues(
        { light: true },
        ["title", "color"],
        ["primary", "link", "info", "success", "warning", "danger"]
    )
);

const COLORS_OUTLINED = addIndexField(
    createExamplesSetForPropertyNameValues(
        { outlined: true },
        ["title", "color"],
        ["primary", "link", "info", "success", "warning", "danger"]
    )
);

const COLORS_INVERTED = addIndexField(
    createExamplesSetForPropertyNameValues(
        { inverted: true },
        ["title", "color"],
        ["primary", "link", "info", "success", "warning", "danger"]
    )
);

const COLORS_ROUNDED = addIndexField(
    createExamplesSetForPropertyNameValues(
        { rounded: true },
        ["title", "color"],
        ["primary", "link", "info", "success", "warning", "danger"]
    )
);

const COLORS_RAISED = addIndexField(
    createExamplesSetForPropertyNameValues(
        { raised: true },
        ["title", "color"],
        ["primary", "link", "info", "success", "warning", "danger"]
    )
);

const DISABLED = addIndexField(
    createExamplesSetForPropertyNameValues(
        { disabled: true },
        ["title", "color"],
        ["primary", "link", "info", "success", "warning", "danger"]
    )
);

const SIZES = addIndexField(
    createExamplesSetForPropertyNameValues(
        {},
        ["size", "title"],
        ["small", "default", "normal", "medium", "large"]
    )
);

const STATES = addIndexField(
    createExamplesSetForPropertyNameValues(
        { color: "primary" },
        ["state", "title"],
        ["normal", "hover", "focus", "active", "static", "loading"]
    )
);

const ButtonExamples = [
    {
        title: "Simple",
        description: "Simple",
        props: [
            {
                title: "Button",
            },
        ],
    },
    {
        title: "Simple - loading",
        description: "Simple - loading",
        props: [
            {
                title: "Button",
                loading: true,
            },
        ],
    },
    {
        title: "Color",
        description: "Colorized",
        props: COLORS,
    },
    {
        title: "Sizes",
        description: "Sizes versions",
        props: SIZES,
    },
    {
        title: "Color - light",
        description: "Light versions",
        props: COLORS_LIGHT,
    },
    {
        title: "Styles - outlined",
        description: "Outlined versions",
        props: COLORS_OUTLINED,
    },
    {
        title: "Styles - inverted",
        description: "Inverted versions",
        props: COLORS_INVERTED,
    },
    {
        title: "Styles - rounded",
        description: "Rounded versions",
        props: COLORS_ROUNDED,
    },
    {
        title: "Styles - raised",
        description: "Raised versions",
        props: COLORS_RAISED,
    },

    {
        title: "Disabled",
        description: "Disabled versions",
        props: DISABLED,
    },

    {
        title: "States",
        description: "Stated versions",
        props: STATES,
    },
    {
        title: "Icons",
        description: "Versions with icons",
        props: [
            {
                title: "",
                size: "small",
                icon: "bold",
            },
            {
                title: "",
                size: "normal",
                icon: "bold",
            },
            {
                title: "",
                size: "medium",
                icon: "bold",
            },
            {
                title: "",
                size: "large",
                icon: "bold",
            },
            {
                title: "Trash",
                size: "large",
                icon: "trash",
            },
            {
                title: "Trash",
                color: "danger",
                size: "large",
                icon: "trash",
                inverted: true,
                iconSide: "left",
            },
        ],
    },
    {
        title: "Action",
        description: "Action on click, will toggle element class 'is-inverted'",
        props: [
            {
                title: "Click me!",
                color: "warning",
                size: "large",
                value: 42,
                action: (e, value) => {
                    e.preventDefault();
                    e.currentTarget.classList.toggle("is-inverted");
                    alert(value);
                    return false;
                },
            },
        ],
    },
];

window.EXAMPLES.UIButton = {
    constructor: "Elements.Buttons.UIButton",
    list: ButtonExamples,
};
