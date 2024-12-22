if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const IconExamples = [
    {
        title: "Font Icon",
        props: [
            {
                title: "",
                font: "plus",
                size: "small",
            },
            {
                title: "",
                font: "plus",
            },
            {
                title: "Icon",
                font: "plus",
                size: "medium",
            },
            {
                title: "Font Icon",
                font: "plus",
                size: "large",
            },
        ],
    },
    {
        title: "SVG Icon",
        description:
            "props.*.svg не показывается правильно, смотри исходники для примера",
        props: [
            {
                title: "Font Icon",
                svg: '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" x="0px" y="0px" viewBox="0 0 512.021 512.021" style="enable-background:new 0 0 512.021 512.021;" xml:space="preserve" width="512" height="512"><g><path d="M301.258,256.01L502.645,54.645c12.501-12.501,12.501-32.769,0-45.269c-12.501-12.501-32.769-12.501-45.269,0l0,0   L256.01,210.762L54.645,9.376c-12.501-12.501-32.769-12.501-45.269,0s-12.501,32.769,0,45.269L210.762,256.01L9.376,457.376   c-12.501,12.501-12.501,32.769,0,45.269s32.769,12.501,45.269,0L256.01,301.258l201.365,201.387   c12.501,12.501,32.769,12.501,45.269,0c12.501-12.501,12.501-32.769,0-45.269L301.258,256.01z"/></g>',
            },
        ],
    },
    {
        title: "Image source Icon",
        props: [
            {
                title: "Image src Icon",
                src: "/img/icon/logo/icon-32.png",
                height: 32,
                width: 32,
            },
            {
                title: "Image src Icon",
                src: "/img/icon/logo/icon-32.png",
                height: 64,
                width: 64,
            },
        ],
    },
];

window.EXAMPLES.UIIcon = {
    constructor: "Elements.Icons.UIIcon",
    list: IconExamples,
};
