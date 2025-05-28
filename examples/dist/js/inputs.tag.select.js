if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input tag select",
        props: [
            {
                variants: [
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
                ],
                onchange: (...args) =>
                    console.log("tag select change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UITagSelect = {
    constructor: "Elements.Inputs.UITagSelect",
    list: Examples,
};
