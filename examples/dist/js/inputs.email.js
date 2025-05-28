if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input email",
        props: [
            {
                placeholder: "some email",
                value: "",
            },
        ],
    },
];

window.EXAMPLES.UIEmail = {
    constructor: "Elements.Inputs.UIEmail",
    list: Examples,
};
