if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const IconExamples = [
    {
        title: "Варианты",
        props: [
            {},
            {
                side: "left",
                size: "normal",
            },
            {
                validated: false,
                side: "left",
                size: "normal",
            },
            {
                validated: true,
                side: "left",
                size: "normal",
            },
            {
                validated: true,
                valid: true,
                side: "left",
                size: "normal",
            },
            {
                validated: true,
                valid: false,
                side: "left",
                size: "normal",
            },
        ],
    },
];

window.EXAMPLES.UIValidatedIcon = {
    constructor: "Elements.Forms.UIValidatedIcon",
    list: Examples,
};
