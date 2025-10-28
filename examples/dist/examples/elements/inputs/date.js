if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input date",
        props: [
            {
                placeholder: "some texfield",
                value: "",
                onchange: (...args) => console.log("date change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UIDate = {
    constructor: "Elements.Inputs.UIDate",
    list: Examples,
};
