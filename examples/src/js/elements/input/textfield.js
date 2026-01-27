if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input textfield",
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
                value: "value",
                required: false,
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },
            {
                placeholder: "some texfield",
                value: "value",
                disabled: true,
            },
            {
                placeholder: "some texfield",
                value: "value",
                readonly: true,
            },
            {
                placeholder: "some texfield",
                value: "value",
                valid: false,
            },
            {
                placeholder: "some texfield",
                value: "value",
                valid: false,
                required: true,
                pattern: "\\w{3,10}",
            },
        ],
    },
];

window.EXAMPLES.UITextfield = {
    constructor: "Elements.Inputs.UITextfield",
    list: Examples,
};
