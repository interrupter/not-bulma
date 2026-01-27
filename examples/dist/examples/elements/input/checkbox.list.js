if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input checkbox list",
        props: [
            {
                onchange: (...args) => console.log(...args),
                value: [4, 1],
                variants: [
                    {
                        id: 1,
                        label: "1",
                    },
                    {
                        id: 2,
                        label: "2",
                    },
                    {
                        id: 3,
                        label: "3",
                        disabled: true,
                    },
                    {
                        id: 4,
                        label: "4 - TRUE",

                        readonly: true,
                    },

                    {
                        id: 5,
                        label: "5 - FALSE",

                        readonly: true,
                    },
                ],
            },
        ],
    },
];

window.EXAMPLES.UICheckboxList = {
    constructor: "Elements.Inputs.UICheckboxList",
    list: Examples,
};
