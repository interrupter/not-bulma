import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "UINavbarItem",
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

window.EXAMPLES.UINavbarItem = {
    constructor: "Elements.Navigations.UINavbarItem",
    list: Examples,
};
