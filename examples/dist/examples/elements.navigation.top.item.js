import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "TopItem",
        props: [],
    },
];

window.EXAMPLES.NavigationTopItem = {
    constructor: "Elements.Navigation.TopItem",
    list: Examples,
};
