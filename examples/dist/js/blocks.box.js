import { createExamplesSetForMutations, addIndexField } from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const INIT_OBJ = {
    class: "lorem-ipsum-dolor-content"
};

const BlocksBoxExamples = [{
    title: "Simple",
    description: "Simple",
    props: addIndexField(createExamplesSetForMutations(INIT_OBJ, [{}, {
        onclick() {
            alert("box click");
        }
    }, {
        onclick() {
            alert("box click");
        },
        onkeyup() {
            alert("box keyup");
        }
    }]))
}];

window.EXAMPLES.UIBox = {
    constructor: "Elements.Blocks.UIBox",
    list: BlocksBoxExamples
};