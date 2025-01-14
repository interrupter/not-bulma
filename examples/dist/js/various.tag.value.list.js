if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Example",
    props: [{
        values: [{
            title: {
                title: "Step 1",
                color: "black"
            },
            value: {
                title: "OK",
                color: "success"
            }
        }, {
            title: {
                title: "Step 2",
                color: "black"
            },
            value: {
                title: "Failed",
                color: "danger"
            }
        }, {
            title: {
                title: "Step 3",
                color: "black"
            },
            value: {
                title: "in progress...",
                color: "warning"
            }
        }]
    }]
}];

window.EXAMPLES.UITagValueList = {
    constructor: "Elements.Various.UITagValueList",
    list: Examples
};