import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const items = [
    {
        id: 1,
        place: "start",
        href: "/home_happy",
        title: "Happy Home",
    },
    {
        id: 2,
        place: "start",
        href: "/home_sad",
        title: "Sad Home",
    },
    {
        id: 3,
        place: "start",
        href: "/home_satisfied",
        title: "Satisfied Home",
    },
];

const LayoutsExamples = [
    {
        title: "UIPanelTop",
        props: addIndexField([
            {
                id: "1",
                class: "has-background-success",
                items,
                ...createInnerTextNodeSnippet("UIPanelTop"),
            },
            {
                id: "2",
                class: "has-background-danger",
                items,
                ...createInnerTextNodeSnippet("UIPanelTop"),
            },
        ]),
    },
];

window.EXAMPLES.UIPanelTop = {
    constructor: "Elements.Layouts.UIPanelTop",
    list: LayoutsExamples,
};
