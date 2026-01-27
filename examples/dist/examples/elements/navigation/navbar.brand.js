import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "UINavbarBrand",
        props: [
            {
                title: "Brand name",
            },
        ],
    },
];

window.EXAMPLES.UINavbarBrand = {
    constructor: "Elements.Navigations.UINavbarBrand",
    list: Examples,
};
