if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input range",
        props: [
            {
                placeholder: "some texfield",
                value: 14,
                min: 0,
                max: 50,
                onchange: (...args) => console.log("range change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UIRange = {
    constructor: "Elements.Inputs.UIRange",
    list: Examples,
};
