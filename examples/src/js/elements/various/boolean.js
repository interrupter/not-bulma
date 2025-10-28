import { createExamplesSetForMutations } from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const INIT_OBJ = {
    LC_TRUE: "Да",
    LC_FALSE: "Нет",
};

const BooleanExamples = [
    {
        title: "Simple",
        description: "Simple",
        props: createExamplesSetForMutations(INIT_OBJ, [
            {
                value: true,
            },
            {
                value: false,
            },
            {},
            {
                inverted: true,
            },
        ]),
    },
];

window.EXAMPLES.UIBoolean = {
    constructor: "Elements.Various.UIBoolean",
    list: BooleanExamples,
};
