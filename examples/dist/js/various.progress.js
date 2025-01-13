if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Simple",
    description: "Simple",
    props: [{}, { value: 10 }, { value: 10, max: 10, color: "danger", size: "small" }]
}];

window.EXAMPLES.UIProgress = {
    constructor: "Elements.Various.UIProgress",
    list: Examples
};