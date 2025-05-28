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
        description: "links to images in two main forms",
        props: [
            {
                url: IMG_SRC.small,
                title: "Link to small image",
            },
            {
                url: IMG_SRC.normal,
                title: "Link to normal image",
                button: false,
            },
        ],
    },
    {
        title: "Links",
        description: "links to images with icons",
        props: [
            {
                url: IMG_SRC.small,
                title: "Link to small image",
                iconSide: "left",
                icon: "link",
                size: "small",
                inverted: true,
            },
            {
                url: IMG_SRC.normal,
                title: "Link to normal image",
                iconSide: "left",
                icon: "link",
                outlined: true,
                size: "normal",
                color: "primary",
            },
            {
                url: IMG_SRC.big,
                title: "Link to big image",
                iconSide: "left",
                icon: "link",
                raised: true,
                size: "medium",
                color: "danger",
            },
            {
                url: IMG_SRC.large,
                title: "Link to large image",
                iconSide: "left",
                icon: "link",
                size: "large",
                rounded: true,
                color: "warning",
            },
            {
                url: IMG_SRC.large,
                title: "Link to large image",
                loading: true,
            },
        ],
    },
];

window.EXAMPLES.UILink = {
    constructor: "Elements.Links.UILink",
    list: LinkExamples,
};
