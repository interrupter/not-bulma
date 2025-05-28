if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const VARIANTS = [
    {
        id: 1,
        title: "Success",
        type: "success",
    },
    {
        id: 2,
        title: "Info",
        type: "info",
    },
    {
        id: 3,
        title: "Danger",
        type: "danger",
    },
    {
        id: 4,
        title: "Primary",
        type: "primary",
    },
];

const Examples = [
    {
        title: "Input switch list",
        props: [
            {
                value: [2, 4],
                variants: VARIANTS,
                readonly: true,
            },
            {
                value: [2],
                variants: VARIANTS,
                onchange: (...args) => console.log("switch change", ...args),
            },
            {
                variants: VARIANTS,
                fieldname: "switch-2",
                onchange: (...args) => console.log("switch change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UISwitchList = {
    constructor: "Elements.Inputs.UISwitchList",
    list: Examples,
};
