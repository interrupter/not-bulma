if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Simple",
        description: "Simple",
        props: [
            {
                values: true,
            },
            {
                values: [
                    {
                        LC_TRUE: "трезвый",
                        LC_FALSE: "пьяный",
                        value: false,
                    },
                ],
            },
            {},
            {
                values: [
                    {
                        LC_TRUE: "пьяный",
                        LC_FALSE: "трезвый",
                        value: false,
                    },
                    {
                        LC_TRUE: "пьяный",
                        LC_FALSE: "трезвый",
                        value: true,
                    },
                ],
                inverted: true,
            },
        ],
    },
];

window.EXAMPLES.UIBooleans = {
    constructor: "Elements.Various.UIBooleans",
    list: Examples,
};
