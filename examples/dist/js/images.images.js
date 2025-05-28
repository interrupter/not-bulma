if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}
const IMG_SRC = {
    small: "/img/icon/logo/icon-32.png",
    normal: "/img/icon/logo/icon-64.png",
    big: "/img/icon/logo/icon-128.png",
    large: "/img/icon/logo/icon-256.png",
};

const ImageExamples = [
    {
        title: "List of images",
        props: [
            {
                values: [
                    {
                        url: IMG_SRC.small,
                        width: "4rem",
                        height: "4rem",
                        contained: true,
                        pointable: true,
                    },
                    {
                        url: IMG_SRC.normal,
                        width: "4rem",
                        height: "4rem",
                        contained: true,
                        pointable: true,
                    },
                    {
                        url: IMG_SRC.big,
                        width: "4rem",
                        height: "4rem",
                        contained: true,
                        pointable: true,
                    },
                    {
                        url: IMG_SRC.large,
                        width: "10rem",
                        height: "10rem",
                        contained: true,
                        pointable: true,
                    },
                ],
            },
        ],
    },
    {
        title: "List of images with pointable and title overriden",
        props: [
            {
                pointable: false,
                title: "Altered from UIImages",
                values: [
                    {
                        url: IMG_SRC.small,
                        width: "4rem",
                        height: "4rem",
                        contained: true,
                        pointable: true,
                    },
                    {
                        url: IMG_SRC.normal,
                        width: "4rem",
                        height: "4rem",
                        contained: true,
                        pointable: true,
                    },
                    {
                        url: IMG_SRC.big,
                        width: "4rem",
                        height: "4rem",
                        contained: true,
                        pointable: true,
                    },
                    {
                        url: IMG_SRC.large,
                        width: "12rem",
                        height: "12rem",
                        contained: true,
                        pointable: true,
                    },
                ],
            },
        ],
    },
];

window.EXAMPLES.UIImages = {
    constructor: "Elements.Images.UIImages",
    list: ImageExamples,
};
