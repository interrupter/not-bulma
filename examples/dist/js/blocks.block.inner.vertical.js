import {
    createExamplesSetForMutations,
    addIndexField,
} from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const INIT_OBJ = {
    class: "lorem-ipsum-dolor-content",
};

const BlocksBlockInnerVerticalExamples = [
    {
        title: "Simple",
        description: "Simple",
        props: addIndexField(
            createExamplesSetForMutations(INIT_OBJ, [
                {},
                {
                    onclick() {
                        alert("block inner vertical click");
                    },
                },
                {
                    onclick() {
                        alert("block inner vertical click");
                    },
                    onkeyup() {
                        alert("block inner vertical keyup");
                    },
                },
            ])
        ),
    },
];

window.EXAMPLES.UIBlockInnerVertical = {
    constructor: "Elements.Blocks.UIBlockInnerVertical",
    list: BlocksBlockInnerVerticalExamples,
};
