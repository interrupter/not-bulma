import { createExamplesSetForMutations, addIndexField } from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const INIT_OBJ = {
    classes: "lorem-ipsum-dolor-content"
};

const BlockBlockExamples = [{
    title: "Simple",
    description: "Simple",
    props: addIndexField(createExamplesSetForMutations(INIT_OBJ, [{}, {
        onclick() {
            alert("block click");
        }
    }, {
        onclick() {
            alert("block click");
        },
        onkeyup() {
            alert("block keyup");
        }
    }]))
}];

window.EXAMPLES.UIBlock = {
    constructor: "Elements.Blocks.UIBlock",
    list: BlockBlockExamples
};