if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Overlay",
        props: [
            {
                $trigger: "overlay one - close by click on any part",
                props: {
                    class: "has-background-light",
                    children(target) {
                        target.before(
                            document.createTextNode("Close by clicking")
                        );
                    },
                    onreject() {
                        alert("Overlay rejected");
                    },
                },
            },
            {
                $trigger: "overlay two - close by button click",
                props: {
                    closeButton: true,
                    closeOnClick: false,
                    class: "has-background-light",
                    onreject() {
                        alert("Overlay rejected");
                    },
                },
            },
        ],
    },
];

window.EXAMPLES.UIOverlay = {
    constructor: "Elements.Modals.UIOverlay",
    list: Examples,
};
