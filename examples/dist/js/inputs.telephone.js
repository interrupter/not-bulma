if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input telephone",
        props: [
            {
                value: "",
            },
            {
                required: false,
                size: "large",
                onchange({ field, value }, event) {
                    console.log("change", field, value, event);
                },
            },
        ],
    },
];

window.EXAMPLES.UITelephone = {
    constructor: "Elements.Inputs.UITelephone",
    list: Examples,
};
