if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const IMG_SRC = {
    small: "/img/icon/logo/icon-32.png",
    normal: "/img/icon/logo/icon-64.png",
    big: "/img/icon/logo/icon-128.png",
    large: "/img/icon/logo/icon-256.png"
};

const ImageExamples = [{
    title: "Images",
    description: "default size and titles",
    props: [{
        url: IMG_SRC.small,
        title: "1"
    }, {
        url: IMG_SRC.normal,
        title: "2"
    }, {
        url: IMG_SRC.big,
        title: "3"
    }, {
        url: IMG_SRC.large,
        title: "4"
    }]
}, {
    title: "Images",
    description: "different sizes and urlFull",
    props: [{
        url: IMG_SRC.small,
        urlFull: IMG_SRC.large,
        size: 32
    }, {
        url: IMG_SRC.normal,
        urlFull: IMG_SRC.large,
        size: 64
    }, {
        url: IMG_SRC.big,
        urlFull: IMG_SRC.large,
        size: 128
    }, {
        url: IMG_SRC.large,
        size: 256
    }]
}, {
    title: "Images with custom width and height",
    description: "custom width and height",
    props: [{
        url: IMG_SRC.small,
        width: "1rem",
        height: "1rem"
    }, {
        url: IMG_SRC.normal,
        width: "2rem",
        height: "1rem"
    }, {
        url: IMG_SRC.big,
        width: "2rem",
        height: "3rem"
    }, {
        url: IMG_SRC.large,
        width: "16rem",
        height: "12rem"
    }]
}, {
    title: "Contained images",
    description: "fit into size and pointable",
    props: [{
        url: IMG_SRC.small,
        width: "1rem",
        height: "1rem",
        contained: true,
        pointable: true
    }, {
        url: IMG_SRC.normal,
        width: "2rem",
        height: "1rem",
        contained: true,
        pointable: true
    }, {
        url: IMG_SRC.big,
        width: "2rem",
        height: "3rem",
        contained: true,
        pointable: true
    }, {
        url: IMG_SRC.large,
        width: "16rem",
        height: "12rem",
        contained: true,
        pointable: true
    }]
}, {
    title: "Contained images",
    description: "fit into width x height and onclick alert, pointer cursor turns on if onclick assigned, could be overriden by setting pointable = false",
    props: [{
        url: IMG_SRC.small,
        width: "1rem",
        height: "1rem",
        covered: true,
        onclick: () => alert("small")
    }, {
        url: IMG_SRC.normal,
        width: "2rem",
        height: "1rem",
        covered: true,
        onclick: () => alert("normal"),
        pointable: false
    }, {
        url: IMG_SRC.big,
        width: "2rem",
        height: "3rem",
        covered: true,
        onclick: () => alert("big")
    }, {
        url: IMG_SRC.large,
        width: "16rem",
        height: "12rem",
        covered: true,
        onclick: () => alert("large"),
        pointable: false
    }]
}];

window.EXAMPLES.UIImage = {
    constructor: "Elements.Images.UIImage",
    list: ImageExamples
};