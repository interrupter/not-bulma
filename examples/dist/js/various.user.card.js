if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Simple",
    description: "Simple",
    props: [{
        image: "/img/icon/logo/icon-32.png"
    }, {
        image: "/img/icon/logo/icon-32.png",
        username: "username",
        role: "manager"
    }]
}];

window.EXAMPLES.UIUserCard = {
    constructor: "Elements.Various.UIUserCard",
    list: Examples
};