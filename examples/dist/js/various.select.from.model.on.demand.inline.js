if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Examples",
        props: [
            {
                placeholder: "empty variants list",
            },
            {
                loaded: true,
                variants: [
                    { id: 1, title: "item 1" },
                    { id: 2, title: "item 2" },
                ],
                onresolve(variant) {
                    console.log("UISelectFromModelOnDemandInline:", variant);
                },
            },
        ],
    },
];

window.EXAMPLES.UISelectFromModelOnDemandInline = {
    constructor: "Elements.Various.UISelectFromModelOnDemandInline",
    list: Examples,
};
