if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Few variants",
        props: [
            {
                title: {
                    title: "Tag 1",
                    color: "black",
                },
                value: {
                    title: "OK",
                    color: "success",
                },
            },
            {
                title: {
                    title: "Tag 1",
                    color: "black",
                    size: "small",
                },
                value: {
                    title: "Failed",
                    color: "danger",
                    size: "small",
                },
                actionsGroupProps: { class: "ml-3" },
                actions: [
                    {
                        title: "retry!",
                        action: () => {
                            alert("retry!");
                        },
                        size: "small",
                    },
                ],
            },

            {
                title: {
                    title: "Tag 1",
                    color: "black",
                    size: "small",
                },
                value: {
                    title: "Failed",
                    color: "danger",
                    size: "small",
                },
                readonly: true,
                actions: [
                    {
                        title: "retry!",
                        action: () => {
                            alert("retry!");
                        },
                        size: "small",
                    },
                ],
            },
        ],
    },
];

window.EXAMPLES.UITagValue = {
    constructor: "Elements.Various.UITagValue",
    list: Examples,
};
