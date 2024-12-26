if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Examples",
    props: [{
        title: "success",
        message: "success"
    }, {
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
        }
    }]
}];

window.EXAMPLES.UISuccess = {
    constructor: "Elements.Notifications.UISuccess",
    list: Examples
};