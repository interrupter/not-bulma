if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input with delayed validation = 1000ms",
        props: [
            {
                value: {
                    some: "json",
                    valid: true,
                },
                onchange: console.log,
                onerror: console.error,
                reactOn: ["onblur", "oninput"],
            },
            {
                value: {
                    some: "json",
                    valid: true,
                },
                onchange: console.log,
                onerror: console.error,
                colorValid: "primary",
                colorInvalid: "warning",
                reactOn: ["onblur", "oninput"],
            },
            {
                value: {
                    some: "json",
                    valid: true,
                },
                onchange: console.log,
                onerror: console.error,
                reactOn: ["onblur"],
                size: "large",
            },
        ],
    },
    {
        title: "Input readonly",
        props: [
            {
                value: {
                    some: "json",
                    valid: true,
                },
                onchange: console.log,
                onerror: console.error,
                readonly: true,

                reactOn: ["onblur", "oninput"],
            },
        ],
    },
    {
        title: "Input disabled",
        props: [
            {
                value: {
                    some: "json",
                    valid: true,
                },
                onchange: console.log,
                onerror: console.error,
                disabled: true,

                reactOn: ["onblur", "oninput"],
            },
        ],
    },
];

window.EXAMPLES.UIJSONArea = {
    constructor: "Elements.Inputs.UIJSONArea",
    list: Examples,
};
