import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "notSideMenu",
        props: [],
    },
];

window.EXAMPLES.notSideMenu = {
    constructor: "Frame.notSideMenu",
    list: Examples,
};
