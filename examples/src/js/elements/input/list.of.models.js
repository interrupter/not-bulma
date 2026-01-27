if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const VARIANTS = [
    {
        locationID: 1,
        title: "Крым",
    },
    {
        locationID: 2,
        title: "Москва",
    },
    {
        locationID: 3,
        title: "Красноярск",
    },
    {
        locationID: 4,
        title: "Санкт-Петербург",
    },
    {
        locationID: 5,
        title: "Омск",
    },
    {
        locationID: 6,
        title: "Камчатка",
    },
    {
        locationID: 7,
        title: "Владивосток",
    },
];

const Examples = [
    {
        title: "Input list of models",
        props: [
            {
                fieldname: "list-of-models",
                optionId: ":locationID",
                optionTitle: ":title",
                modelName: "fakeModel",
                actionName: "fakeAction",
                actionFilter: {},
                transformValueItemToListItem: (v) => {
                    return { ...v, value: v };
                },
                selectorUIProps: {
                    color: "primary",
                    size: "warning",
                    apiModelGetter: async () => {
                        return () => {};
                    },
                    apiRequest: async () => {
                        return { result: VARIANTS };
                    },
                },
                value: [],

                onchange: (...args) => console.log(...args),
            },
        ],
    },
];

window.EXAMPLES.UIListOfModels = {
    constructor: "Elements.Inputs.UIListOfModels",
    list: Examples,
};
