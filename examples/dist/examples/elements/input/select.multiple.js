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
        title: "Input select multiple",
        props: [
            {
                fieldname: "select-multiple-1",
                placeholder: "no selection",
                value: [],
                variants: VARIANTS,
                onchange: (...args) => console.log(...args),
            },
            {
                fieldname: "select-multiple-2",
                placeholder: "no selection",
                value: [2, 3],
                color: "primary",
                variants: VARIANTS,
                emptyValueEnabled: false,
                onchange: (...args) => console.log(...args),
            },
            {
                fieldname: "select-multiple-3",
                placeholder: "no selection",
                value: [1, 4],
                size: "small",
                variants: VARIANTS,
                onchange: (...args) => console.log(...args),
            },
        ],
    },
    {
        title: "Input readonly",
        props: [
            {
                fieldname: "select-multiple-4",
                placeholder: "no selection",
                value: [1, 4],
                color: "success",
                readonly: true,
                variants: VARIANTS,
                onchange: (...args) => console.log(...args),
            },
        ],
    },
    {
        title: "Input disabled",
        props: [
            {
                fieldname: "select-multiple-5",
                placeholder: "no selection",
                value: [1, 4],
                color: "danger",
                rows: 5,
                disabled: true,
                variants: VARIANTS,
                onchange: (...args) => console.log(...args),
            },
        ],
    },
    {
        title: "Empty selection",
        props: [
            {
                fieldname: "select-multiple-5",
                placeholder: "no selection",
                value: [],
                color: "danger",
                rows: 5,
                readonly: true,
                variants: VARIANTS,
                onchange: (...args) => console.log(...args),
            },
        ],
    },
];

window.EXAMPLES.UISelectMultiple = {
    constructor: "Elements.Inputs.UISelectMultiple",
    list: Examples,
};
