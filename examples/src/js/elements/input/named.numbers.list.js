if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input named number list",
        props: [
            {
                fieldname: "numbers_list",
                placeholder: "new value name",
                value: {
                    "Value 1": 1,
                    "Value 2": 2,
                },
                onchange: (...args) => console.log("number change", ...args),
            },
            {
                fieldname: "numbers_list-1",
                placeholder: "new value name",
                defaultItemTitle: "new value",
                defaultItemValue: 10,
                value: {
                    "Value 1": 1,
                    "Value 2": 2,
                },
                onchange: (...args) => console.log("number change", ...args),
            },
        ],
    },
    {
        title: "Input named number list - readonly",
        props: [
            {
                fieldname: "numbers_list-2",
                readonly: true,
                placeholder: "",
                value: {
                    "Value 1": 1,
                    "Value 2": 2,
                },
                onchange: (...args) => console.log("number change", ...args),
            },
        ],
    },
    {
        title: "Input named number list - disabled",
        props: [
            {
                fieldname: "numbers_list-3",
                placeholder: "",
                disabled: true,
                value: {
                    "Value 1": 1,
                    "Value 2": 2,
                },
                onchange: (...args) => console.log("number change", ...args),
            },
        ],
    },
];

window.EXAMPLES.UINamedNumbersList = {
    constructor: "Elements.Inputs.UINamedNumbersList",
    list: Examples,
};
