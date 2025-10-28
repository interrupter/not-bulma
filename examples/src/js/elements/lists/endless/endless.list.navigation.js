if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "List",
        props: [
            {
                page: 0,
                pages: 10,
            },
            {
                page: 0,
                pages: 20,
                buttonPrevProps: {
                    title: "<",
                    color: "success",
                    outlined: true,
                },
                buttonNextProps: {
                    title: ">",
                    color: "danger",
                },
                progressTitleStart: "Some ",
                progressTitleDelimiter: " of ",
                progressTitleEnd: " total pages.",
            },
        ],
    },
];

window.EXAMPLES.UIEndlessListNavigation = {
    constructor: "Elements.Lists.UIEndlessListNavigation",
    list: Examples,
};
