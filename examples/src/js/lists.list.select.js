if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

//import { createList } from "./examples.helpers";

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
        title: "List",
        props: [
            {
                atLeastOne: false,
                onchange(...args) {
                    console.log("change", ...args);
                },
                variants: [
                    {
                        id: 1,
                        title: "item 1",
                        description: "description",
                        value: {
                            id: 1,
                        },
                    },
                    {
                        id: 2,
                        title: "item 2",
                        description: "description",
                        value: {
                            id: 2,
                        },
                    },
                    {
                        id: 3,
                        title: "item 3",
                        image: "/img/icon/logo/icon-32.png",
                        description:
                            "description 8317490v812943p8b -21398-128935u4-18u3 5-1ur3-19820 u43-r9821u3 rp98021u98430 ru-21p98u3 -982 3",
                        value: {
                            id: 3,
                        },
                    },
                ],
            },
        ],
    },
];

window.EXAMPLES.UIListSelect = {
    constructor: "Elements.Lists.UIListSelect",
    list: Examples,
};
