import { createExamplesSetForMutations } from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const INIT_OBJ = {
    LC_TRUE: "Да",
    LC_FALSE: "Нет"
};

const Examples = [{
    title: "Simple",
    description: "Simple",
    props: createExamplesSetForMutations(INIT_OBJ, [{
        value: true,
        label: "label +"
    }, {
        value: false,
        label: "label - "
    }, {
        label: "no value"
    }, {
        inverted: true,
        label: "!label"
    }])
}];

window.EXAMPLES.UIBooleanLabeled = {
    constructor: "Elements.Various.UIBooleanLabeled",
    list: Examples
};