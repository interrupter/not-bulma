import {
    addIndexField,
    createInnerTextNodeSnippet,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "UINavbarItemLink",
        props: [
            {
                color: "info",
                light: true,
                url: "https://google.com",
                title: "google",
                icon: "cross",
                size: "large",
            },
            {
                color: "success",
                outlined: true,
                url: "https://github.com",
                title: "github",
                icon: "cloud",
                size: "small",
            },
        ],
    },
];

window.EXAMPLES.UINavbarItemLink = {
    constructor: "Elements.Navigations.UINavbarItemLink",
    list: Examples,
};
