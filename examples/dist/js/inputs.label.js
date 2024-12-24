if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Input label",
    props: [{
        for: "input-example-t",
        children(target) {
            const el = document.createElement("span");
            el.id = "input-example-t";
            el.innerText = "Label 1 from children";
            target.before(el);
        }
    }, {
        for: "input-example-t-1",
        label: "Label 2 from label"
    }]
}];

window.EXAMPLES.UILabel = {
    constructor: "Elements.Inputs.UILabel",
    list: Examples
};