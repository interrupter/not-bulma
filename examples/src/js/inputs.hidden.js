if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input textfield",
        props: [
            {
                fieldname: "some_texfield",
                value: "",
                onchange: (...args) => console.log("hidden change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UIHidden = {
    constructor: "Elements.Inputs.UIHidden",
    list: Examples,
};
