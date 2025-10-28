if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Few variants",
        props: [
            {
                title: "Tag 1",
                color: "success",
            },
            {
                title: "Tag 2!",
                color: "warning",
                size: "small",
            },
            {
                title: "Clickable tag!",
                color: "success",
                size: "large",
                bold: true,
                padding: "large",
                action: () => {
                    alert("alerting via Tag action!");
                },
            },
        ],
    },
];

window.EXAMPLES.UITag = {
    constructor: "Elements.Various.UITag",
    list: Examples,
};
