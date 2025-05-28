if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input switch",
        props: [
            {
                label: "some switch",
                value: true,
                onchange: (...args) => console.log("switch change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UISwitch = {
    constructor: "Elements.Inputs.UISwitch",
    list: Examples,
};
