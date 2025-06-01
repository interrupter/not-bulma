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
        title: "Input autocomplete",
        props: [
            {
                valueFieldName: "locationID",
                labelFieldName: "title",
                fieldname: "autocomplete",
                searchFunction: async () => {
                    return VARIANTS;
                },
                onchange: (...args) => console.log(...args),
            },
        ],
    },
];

window.EXAMPLES.UIRadioButtons = {
    constructor: "Elements.Inputs.UIRadioButtons",
    list: Examples,
};
