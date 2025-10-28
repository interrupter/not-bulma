if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Examples",
        props: [
            {
                title: "error",
                message: "error",
            },
            {
                title: "title snippet",
                titleSnip(target, title) {
                    const el = document.createElement("snap");
                    el.innerText = title();
                    target.before(el);
                },
                message: "message snippet",
                messageSnip(target, message) {
                    const el = document.createElement("snap");
                    el.innerText = message();
                    target.before(el);
                },
                class: "is-info",
            },
        ],
    },
];

window.EXAMPLES.UIError = {
    constructor: "Elements.Notifications.UIError",
    list: Examples,
};
