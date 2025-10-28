import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "notTopMenu",
        props: [],
    },
];

window.EXAMPLES.notTopMenu = {
    constructor: "Frame.notTopMenu",
    list: Examples,
};
