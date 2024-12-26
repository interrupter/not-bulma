if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

//removing state
localStorage.removeItem("cookie_date");

const Examples = [{
    title: "Examples",
    props: [{
        show: true,
        message: "We use cookies!",
        agree: "no problemo"
    }, {
        show: true,
        message: "We use cookies!",
        agree: "no problemo for next 2 seconds",
        cooldown: 2000
    }]
}];

window.EXAMPLES.UICookieNotification = {
    constructor: "Elements.Notifications.UICookieNotification",
    list: Examples
};