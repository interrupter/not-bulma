import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "UINavbarItemDevider",
        props: [{}, { hidden: "tablet-only" }, { hidden: "desktop" }],
    },
];

window.EXAMPLES.UINavbarItemDevider = {
    constructor: "Elements.Navigations.UINavbarItemDevider",
    list: Examples,
};
