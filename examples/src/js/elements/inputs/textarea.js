if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input textarea",
        props: [
            {
                placeholder: "some texfield",
                value: "",
            },
            {
                placeholder: "some texfield",
                value: "value",
            },
            {
                placeholder: "some texfield",

                value: "Large textarea",
                required: false,
                size: "large",
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },
            {
                placeholder: "some texfield",
                value: "Large textarea",
                disabled: true,
                rows: 3,
                size: "large",
            },
            {
                placeholder: "Large textarea",
                value: "value",
                readonly: true,
            },
            {
                placeholder: "some texfield",
                value: "value",
                valid: false,
                rows: 10,
                size: "small",
                color: "danger",
            },
            {
                placeholder: "some texfield",
                value: "value",
                valid: false,
                required: true,
            },
        ],
    },
];

window.EXAMPLES.UITextarea = {
    constructor: "Elements.Inputs.UITextarea",
    list: Examples,
};
