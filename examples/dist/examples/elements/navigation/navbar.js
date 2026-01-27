import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const items = [
    {
        id: 1,
        place: "start",
        url: "/home_happy",
        title: "Happy Home",
    },
    {
        id: 2,
        place: "start",
        url: "/home_sad",
        title: "Sad Home",
        items: [
            {
                title: "sub-item-1",
                url: "/sub-item-1",
            },
            {
                title: "sub-item-2",
                url: "/sub-item-2",
            },
            {
                break: true,
            },
            {
                title: "sub-item-3",
                tag: { title: "3", color: "warning", size: "small" },
            },
            {
                title: "sub-item-4",
                url: "/sub-item-4",
                tag: { title: "4", color: "success", size: "large" },
            },
        ],
    },
    {
        id: 3,
        place: "start",
        url: "/home_satisfied",
        title: "Satisfied Home",
    },
];

const Examples = [
    {
        title: "UINavbar",
        props: addIndexField([
            {
                id: "navbar-1",
                class: "has-background-success",
                items,
                ...createInnerTextNodeSnippet("UINavbar"),
            },
            {
                id: "navbar-2",
                class: "has-background-danger",
                items,
                ...createInnerTextNodeSnippet("UINavbar"),
            },
        ]),
    },
];

window.EXAMPLES.UINavbar = {
    constructor: "Elements.Navigations.UINavbar",
    list: Examples,
};
