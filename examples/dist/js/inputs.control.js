if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input control",
        props: [
            {
                id: "input-example-t",
                class: "has-background-light",
                children(target) {
                    const el = document.createElement("span");
                    el.id = "input-control-example-t";
                    el.innerText = "Control 1 from children";
                    target.before(el);
                },
            },
        ],
    },
];

window.EXAMPLES.UIControl = {
    constructor: "Elements.Inputs.UIControl",
    list: Examples,
};
