if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input password",
        props: [
            {
                placeholder: "some password",
                value: "",
                onchange: (...args) => console.log("password change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UIPassword = {
    constructor: "Elements.Inputs.UIPassword",
    list: Examples,
};
