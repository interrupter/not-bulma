if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Examples",
        props: [
            {
                title: "success",
                message: "success",
                color: "success",
            },
            {
                title: "error",
                message: "error",
                color: "danger",
            },
            {
                title: "warning",
                message: "warning",
                color: "warning",
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

window.EXAMPLES.UIMessage = {
    constructor: "Elements.Notifications.UIMessage",
    list: Examples,
};
