import { addIndexField } from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const IMG_SRC = {
    small: "/img/icon/logo/icon-32.png",
    normal: "/img/icon/logo/icon-64.png",
    big: "/img/icon/logo/icon-128.png",
    large: "/img/icon/logo/icon-256.png",
};

const LinkExamples = [
    {
        title: "Links",
        description: "links to images with icons",
        props: [
            {
                itemsProps: {
                    outlined: true,
                    color: "primary",
                },
                values: addIndexField([
                    {
                        url: IMG_SRC.small,
                        title: "Link to small image",
                    },
                    {
                        url: IMG_SRC.normal,
                        title: "Link to normal image",
                    },
                    {
                        url: IMG_SRC.big,
                        title: "Link to big image",
                    },
                    {
                        url: IMG_SRC.large,
                        title: "Link to large image",
                    },
                ]),
            },
        ],
    },
];

window.EXAMPLES.UILinks = {
    constructor: "Elements.Links.UILinks",
    list: LinkExamples,
};
