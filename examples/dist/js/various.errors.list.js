if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Examples",
    props: [{
        show: true,
        errors: ["strange error"]
    }, {
        id: "errors-list-1",
        show: true,
        errors: ["strange error 1", "strange error 2"]
    }]
}];

window.EXAMPLES.UIErrorsList = {
    constructor: "Elements.Various.UIErrorsList",
    list: Examples
};