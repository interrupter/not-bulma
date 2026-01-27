if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input number",
        props: [
            {
                placeholder: "some texfield",
                value: 5,
                onchange: (...args) => console.log("number change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UINumber = {
    constructor: "Elements.Inputs.UINumber",
    list: Examples,
};
