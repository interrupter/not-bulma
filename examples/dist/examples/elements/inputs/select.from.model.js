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
        title: "Input select from model",
        props: [
            {
                fieldname: "select-from-model",
                optionId: ":locationID",
                optionTitle: ":title",
                modelName: "fakeModel",
                actionName: "fakeAction",
                actionFilter: {},
                color: "primary",
                size: "success",
                apiModelGetter: async () => {
                    return () => {};
                },
                apiRequest: async () => {
                    return { result: VARIANTS };
                },
                value: [],

                onchange: (...args) => console.log(...args),
            },
        ],
    },
    {
        title: "Input select from model with loading in 3sec",
        props: [
            {
                fieldname: "select-from-model-1",
                optionId: ":locationID",
                optionTitle: ":title",
                modelName: "fakeModel",
                actionName: "fakeAction",
                actionFilter: {},
                emptyValueEnabled: false,
                color: "primary",
                size: "warning",
                apiModelGetter: async () => {
                    return () => {};
                },
                apiRequest: async () => {
                    await new Promise((resolve) => {
                        setTimeout(resolve, 3000);
                    });
                    return { result: VARIANTS };
                },
                value: [],

                onchange: (...args) => console.log(...args),
            },
        ],
    },
];

window.EXAMPLES.UISelectFromModel = {
    constructor: "Elements.Inputs.UISelectFromModel",
    list: Examples,
};
