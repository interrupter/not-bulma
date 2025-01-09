if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

function createList(itemGenerator, count = 10) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(itemGenerator(i));
    }
    return result;
}

const Examples = [
    {
        title: "Empty list",
        props: [
            {
                data: {
                    list: [],
                    count: 0,
                    page: 0,
                    pages: 0,
                },
            },
        ],
    },
    {
        title: "List",
        props: [
            {
                data: {
                    list: createList((i) => {
                        return {
                            id: i,
                            _id: i,
                            title: `Item number - ${i + 1}`,
                        };
                    }, 10),
                    count: 20,
                    page: 0,
                    pages: 2,
                },
            },
        ],
    },

    {
        title: "List with onselect callback on items",
        props: [
            {
                data: {
                    list: createList((i) => {
                        return {
                            id: 10 + i,
                            _id: 10 + i,
                            title: `Item number - ${10 + i + 1}`,
                        };
                    }, 10),
                    page: 1,
                    pages: 2,
                },
                onselect: ({ _id, id, title }) => {
                    alert(`${_id}, ${id}, ${title}`);
                },
            },
        ],
    },
];

window.EXAMPLES.UIEndlessList = {
    constructor: "Elements.Lists.UIEndlessList",
    list: Examples,
};
