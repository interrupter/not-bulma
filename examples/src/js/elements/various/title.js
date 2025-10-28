if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Sizes",
        props: [
            {
                title: "Title H1",
                subtitle: "Subtitle H2",
            },
            {
                title: "Title H2",
                subtitle: "Subtitle H3",
                size: 2,
            },
            {
                title: "Title H3",
                subtitle: "Subtitle H4",
                size: 3,
            },
            {
                title: "Title H3",
                subtitle: "Subtitle H4",
                size: 4,
            },
            {
                title: "Title H4",
                subtitle: "Subtitle H5",
                size: 5,
            },
            {
                title: "Title H2",
                subtitle: "Subtitle H5",
                size: 2,
                subsize: 5,
            },
        ],
    },
    {
        title: "Spaced",
        props: [
            {
                title: "Title H1",
                subtitle: "subtitle annotation",
                spaced: false,
            },
            {
                title: "Title H1",
                subtitle: "subtitle annotation",
                spaced: true,
            },
        ],
    },
    {
        title: "Align",
        props: [
            {
                title: "Left sided Title",
                subtitle: "subtitle annotation",
                spaced: false,
                align: "left",
            },
            {
                title: "Right sided Title",
                subtitle: "subtitle annotation",
                spaced: false,
                align: "right",
            },
            {
                title: "Centered Title",
                subtitle: "subtitle annotation",
                spaced: true,
                align: "center",
            },
        ],
    },
];

window.EXAMPLES.UITitle = {
    constructor: "Elements.Various.UITitle",
    list: Examples,
};
