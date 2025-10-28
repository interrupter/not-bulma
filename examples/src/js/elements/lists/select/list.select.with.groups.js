if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

//import { createList } from "./examples.helpers";

function createVariants() {
    return [
        {
            id: 1,
            title: "item 1",
            description: "description",
            variants: [
                {
                    id: 11,
                    title: "item 11",
                },
                {
                    id: 12,
                    title: "item 12",
                },
                {
                    id: 13,
                    title: "item 13",
                },
                {
                    id: 14,
                    title: "item 14",
                },
                {
                    id: 15,
                    title: "item 15",
                },
            ],
        },
        {
            id: 2,
            title: "item 2",
            description: "description",
            variants: [
                {
                    id: 21,
                    title: "item 21",
                },
                {
                    id: 22,
                    title: "item 22",
                },
                {
                    id: 23,
                    title: "item 23",
                },
                {
                    id: 24,
                    title: "item 24",
                },
                {
                    id: 25,
                    title: "item 25",
                },
                {
                    id: 26,
                    title: "item 26",
                },
            ],
        },
        {
            id: 3,
            title: "item 3",
            image: "/img/icon/logo/icon-32.png",
            description:
                "description 8317490v812943p8b -21398-128935u4-18u3 5-1ur3-19820 u43-r9821u3 rp98021u98430 ru-21p98u3 -982 3",
            variants: [
                {
                    id: 31,
                    title: "item 31",
                },
                {
                    id: 32,
                    title: "item 32",
                },
                {
                    id: 33,
                    title: "item 33",
                },

                {
                    id: 34,
                    title: "item 34",
                },
                {
                    id: 35,
                    title: "item 35",
                },
                {
                    id: 36,
                    title: "item 36",
                },
                {
                    id: 37,
                    title: "item 37",
                },
            ],
        },
    ];
}

const Examples = [
    {
        title: "Empty list",
        props: [
            {
                items: [],
            },
        ],
    },
    {
        title: "List (atLeastOne: false, multiple: true, onlyOnePerGroup: false)",
        props: [
            {
                atLeastOne: false,
                multiple: true,
                onlyOnePerGroup: false,
                onchange(...args) {
                    console.log("change", ...args);
                },
                variants: createVariants(),
            },
        ],
    },
    {
        title: "List (atLeastOne: true, multiple: true, onlyOnePerGroup: false)",
        props: [
            {
                atLeastOne: true,
                multiple: true,
                onlyOnePerGroup: false,
                onchange(...args) {
                    console.log("change", ...args);
                },
                variants: createVariants(),
            },
        ],
    },
    {
        title: "List (atLeastOne: true, multiple: true, onlyOnePerGroup: true)",
        props: [
            {
                atLeastOne: true,
                multiple: true,
                onlyOnePerGroup: true,
                onchange(...args) {
                    console.log("change", ...args);
                },
                variants: createVariants(),
            },
        ],
    },
    {
        title: "List (atLeastOne: true, multiple: false, onlyOnePerGroup: true)",
        props: [
            {
                atLeastOne: true,
                multiple: false,
                onlyOnePerGroup: true,
                onchange(...args) {
                    console.log("change", ...args);
                },
                variants: createVariants(),
            },
        ],
    },
    {
        title: "List (atLeastOne: false, multiple: false, onlyOnePerGroup: true)",
        props: [
            {
                atLeastOne: false,
                multiple: false,
                onlyOnePerGroup: true,
                onchange(...args) {
                    console.log("change", ...args);
                },
                variants: createVariants(),
            },
        ],
    },
];

window.EXAMPLES.UIListSelectWithGroups = {
    constructor: "Elements.Lists.UIListSelectWithGroups",
    list: Examples,
};
