import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "UINavbarItemText",
        props: [
            {
                text: "Какой-то текст",
            },
            {},
        ],
    },
];

window.EXAMPLES.UINavbarItemText = {
    constructor: "Elements.Navigations.UINavbarItemText",
    list: Examples,
};
