if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const IconExamples = [{
    title: "Sizes",
    props: [{
        title: "small",
        font: "plus",
        size: "small"
    }, {
        title: "",
        font: "plus"
    }, {
        title: "Icon",
        font: "plus",
        size: "medium"
    }, {
        title: "Font Icon",
        font: "plus",
        size: "large"
    }]
}, {
    title: "Sides",
    props: [{
        font: "plus"
    }, {
        font: "angle-left",
        side: "left"
    }, {
        font: "angle-right",
        side: "right"
    }]
}];

window.EXAMPLES.UIIconFont = {
    constructor: "Elements.Icons.UIIconFont",
    list: IconExamples
};