import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "UINavbarBurger",
        props: [
            {
                active: false,
                class: "is-success",
            },
            {
                active: true,
                class: "is-warning",
            },
        ],
    },
];

window.EXAMPLES.UINavbarBurger = {
    constructor: "Elements.Navigations.UINavbarBurger",
    list: Examples,
};
