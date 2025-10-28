if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input checkbox",
        props: [
            {
                fieldname: "checkbox-1",
                label: "1",
                value: false,
                onchange: (...args) => console.log(...args),
            },
            {
                fieldname: "checkbox-2",
                label: "2",
                value: true,
                onchange: (...args) => console.log(...args),
            },
            {
                fieldname: "checkbox-3",
                label: "3",
                value: true,
                disabled: true,
                onchange: (...args) => console.log(...args),
            },
            {
                fieldname: "checkbox-4",
                label: "4 - TRUE",
                value: true,
                readonly: true,
                onchange: (...args) => console.log(...args),
            },

            {
                fieldname: "checkbox-5",
                label: "5 - FALSE",
                value: false,
                readonly: true,
                onchange: (...args) => console.log(...args),
            },
        ],
    },
];

window.EXAMPLES.UICheckbox = {
    constructor: "Elements.Inputs.UICheckbox",
    list: Examples,
};
