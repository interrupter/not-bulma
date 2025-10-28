/* global notBulma */
if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const VALUES = [
    {
        id: 1,
        title: "Tag 1",
    },
    {
        id: 2,
        title: "Tag 2",
    },
    {
        id: 3,
        title: "Tag 3",
        color: "success",
    },
];

const Examples = [
    {
        title: "Few variants",
        props: [
            {
                values: VALUES,
                UIComponent: notBulma.Elements.Various.UITag,
                UIPlaceholder: notBulma.Elements.Various.UITag,
                placeholderProps: { title: "no selection", color: "warning" },
            },
            {
                id: 1,
                idFieldName: "id",
                values: VALUES,
                UIComponent: notBulma.Elements.Various.UITag,
                UIPlaceholder: notBulma.Elements.Various.UITag,
                placeholderProps: { title: "no selection", color: "warning" },
            },
            {
                id: 3,
                idFieldName: "id",
                values: VALUES,
                UIComponent: notBulma.Elements.Various.UITag,
                UIPlaceholder: notBulma.Elements.Various.UITag,
                placeholderProps: { title: "no selection", color: "warning" },
            },
        ],
    },
];

window.EXAMPLES.UIShowOneFromList = {
    constructor: "Elements.Various.UIShowOneFromList",
    list: Examples,
};
