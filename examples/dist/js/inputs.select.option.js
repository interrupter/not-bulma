if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Input select",
        props: [
            {
                value: 1,
                title: "option 1",
                selected: true,
            },
            {
                value: 2,
                title: "option 2",
                selected: false,
            },
        ],
    },
];

window.EXAMPLES.UISelectOption = {
    constructor: "Elements.Inputs.UISelectOption",
    list: Examples,
};
