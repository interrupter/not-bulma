if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const IconExamples = [{
    title: "Bottom right corner",
    props: [{
        trigger: {
            title: "Floating Icon",
            icon: "plus",
            color: "warning",
            size: "medium",
            onclick: () => {
                alert("Floating Icon click!");
            }
        },
        top: "",
        left: "",
        right: "2em",
        bottom: "3em"
    }]
}];

window.EXAMPLES.UIIconFloating = {
    constructor: "Elements.Icons.UIIconFloating",
    list: IconExamples
};