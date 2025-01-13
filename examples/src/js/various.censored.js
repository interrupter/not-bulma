if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Simple",
        description: "Simple",
        props: [
            { value: "secret 1" },
            { value: "secret 2", copiable: false },
            { value: "secret 3", showable: false },
        ],
    },
];

window.EXAMPLES.UICensored = {
    constructor: "Elements.Various.UICensored",
    list: Examples,
};
