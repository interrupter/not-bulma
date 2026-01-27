if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const VARIANTS = [
    {
        id: 1,
        title: "tag 1",
        type: "info",
    },
    {
        id: 2,
        title: "tag 2",
        type: "success",
    },
    {
        id: 3,
        title: "tag 3",
        type: "primary",
    },
    {
        id: 4,
        title: "tag 4",
        type: "danger",
    },
];

const Examples = [
    {
        title: "Input select",
        props: [
            {
                variants: VARIANTS,
                onchange: (...args) => console.log("select change", ...args),
            },
            {
                variants: VARIANTS,
                onchange: (...args) => console.log("select change", ...args),
                readonly: true,
                value: 2,
            },
            {
                variants: VARIANTS,
                value: "2",
                onchange: (...args) => console.log("select change", ...args),
            },
            {
                variants: VARIANTS,
                placeholder: "Empty value",
                onchange: (...args) => console.log("select change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UISelect = {
    constructor: "Elements.Inputs.UISelect",
    list: Examples,
};
