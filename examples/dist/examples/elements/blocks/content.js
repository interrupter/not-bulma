import {
    createExamplesSetForMutations,
    addIndexField,
} from "/js/examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const INIT_OBJ = {
    class: "lorem-ipsum-dolor-content",
};

const BlocksContentExamples = [
    {
        title: "Simple",
        description: "Simple",
        props: addIndexField(
            createExamplesSetForMutations(INIT_OBJ, [
                {},
                {
                    onclick() {
                        alert("content click");
                    },
                },
                {
                    onclick() {
                        alert("content click");
                    },
                    onkeyup() {
                        alert("content keyup");
                    },
                },
            ])
        ),
    },
];

window.EXAMPLES.UIContent = {
    constructor: "Elements.Blocks.UIContent",
    list: BlocksContentExamples,
};
