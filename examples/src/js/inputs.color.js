if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input color",
        props: [
            {
                placeholder: "some texfield",
                value: "",
                onchange: (...args) => console.log("color change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UIColor = {
    constructor: "Elements.Inputs.UIColor",
    list: Examples,
};
