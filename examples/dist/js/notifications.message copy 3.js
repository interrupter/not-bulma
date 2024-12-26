if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Font Icon",
    props: [{
        title: "success",
        message: "success",
        class: "is-success"
    }, {
        title: "error",
        message: "error",
        class: "is-danger"
    }, {
        title: "warning",
        message: "warning",
        class: "is-warning"
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
        },
        class: "is-info"
    }]
}];

window.EXAMPLES.UIMessage = {
    constructor: "Elements.Notifications.UIMessage",
    list: Examples
};