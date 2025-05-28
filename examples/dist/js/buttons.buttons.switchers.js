if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const ButtonsButtonsSwitchersExamples = [
    {
        title: "Стандартный",
        description: "Simple",
        props: [
            {
                values: [
                    {
                        id: 0,
                        title: "0",
                        selected: false,
                        value: 0,
                    },
                    {
                        id: 1,
                        title: 1,
                        selected: false,
                        value: 1,
                    },
                    {
                        id: 2,
                        title: 2,
                        selected: false,
                        value: 2,
                    },
                ],
            },
        ],
    },
    {
        title: "Минимум один вариант должен быть выбран",
        description: "At least one and centered",
        props: [
            {
                min: 1,
                centered: true,
                onchange: (event) => {
                    console.log(event);
                },
                values: [
                    {
                        id: 0,
                        title: "0",
                        selected: false,
                        value: 0,
                    },
                    {
                        id: 1,
                        title: 1,
                        selected: true,
                        value: 1,
                    },
                    {
                        id: 2,
                        title: 2,
                        selected: false,
                        value: 2,
                    },
                ],
            },
        ],
    },
];

window.EXAMPLES.UIButtonsSwitchers = {
    constructor: "Elements.Buttons.UIButtonsSwitchers",
    list: ButtonsButtonsSwitchersExamples,
};
