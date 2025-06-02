if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const VARIANTS = [
    {
        id: 1,
        value: 1,
        title: "Крым",
    },
    {
        id: 2,
        value: 2,
        title: "Москва",
    },
    {
        id: 3,
        value: 3,
        title: "Красноярск",
    },
    {
        id: 4,
        value: 4,
        title: "Санкт-Петербург",
    },
    {
        id: 5,
        value: 5,
        title: "Омск",
    },
    {
        id: 6,
        value: 6,
        title: "Камчатка",
    },
    {
        id: 7,
        value: 7,
        title: "Владивосток",
    },
];

const Examples = [
    {
        title: "Input radio buttons",
        props: [
            {
                title: "radio select",
                fieldname: "radio-buttons-selector",
                variants: VARIANTS,
                onchange: (...args) => console.log(...args),
            },
            {
                title: "radio select return variant on event",
                fieldname: "radio-buttons-selector-1",
                variants: VARIANTS,
                returnVariant: true,
                onchange: (...args) => console.log(...args),
            },
        ],
    },
];

window.EXAMPLES.UIRadioButtons = {
    constructor: "Elements.Inputs.UIRadioButtons",
    list: Examples,
};
