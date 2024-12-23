import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const LayoutsExamples = [
    {
        title: "Columns of different sizes",
        wrapper: '<div class="columns"></div>',
        wrapperTargetSelector: "div.columns",
        props: addIndexField([
            {
                class: "has-background-success",
                title: "size 1",
                size: 1,
                ...createInnerTextNodeSnippet("size 1"),
            },
            {
                class: "has-background-warning",
                title: "size 2",
                size: 2,
                ...createInnerTextNodeSnippet("size 2"),
            },
            {
                class: "has-background-danger",
                title: "size 3",
                size: 3,
                ...createInnerTextNodeSnippet("size 3"),
            },
            {
                class: "has-background-light",
                title: "size 4",
                size: 4,
                ...createInnerTextNodeSnippet("size 4"),
            },
            {
                class: "has-background-info",
                title: "size 5",
                size: 5,
                ...createInnerTextNodeSnippet("size 5"),
            },
            {
                class: "has-background-primary",
                title: "size 6",
                size: 6,
                ...createInnerTextNodeSnippet("size 6"),
            },
            {
                class: "has-background-link",
                title: "size 7",
                size: 7,
                ...createInnerTextNodeSnippet("size 7"),
            },
            {
                class: "has-background-dark",
                title: "size 8",
                size: 8,
                ...createInnerTextNodeSnippet("size 8"),
            },
            {
                class: "has-background-success",
                title: "size 12",
                size: 12,
                ...createInnerTextNodeSnippet("size 12"),
            },
        ]),
    },
    {
        title: "Narrow columns",
        wrapper: '<div class="columns"></div>',
        wrapperTargetSelector: "div.columns",
        props: addIndexField([
            {
                class: "has-background-dark",
                title: "size 8",
                size: 8,
                narrow: true,
                ...createInnerTextNodeSnippet("size 8"),
            },
            {
                class: "has-background-success",
                title: "size 12",
                size: 12,
                narrow: true,
                ...createInnerTextNodeSnippet("size 12"),
            },
        ]),
    },
];

window.EXAMPLES.UIColumn = {
    constructor: "Elements.Layouts.UIColumn",
    list: LayoutsExamples,
};
