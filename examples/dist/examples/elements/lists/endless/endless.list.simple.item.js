if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "List simple item",
        props: [
            {
                title: "item name",
                id: "some id",
                _id: "some uuid",
                onclick(val) {
                    console.log(val);
                },
            },
        ],
    },
];

window.EXAMPLES.UIEndlessListSimpleItem = {
    constructor: "Elements.Lists.UIEndlessListSimpleItem",
    list: Examples,
};
