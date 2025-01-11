if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [{
    title: "Container size",
    props: [{
        $trigger: {
            title: "Open container loader",
            ttl: 3000
        },
        props: {
            loading: true,
            ttl: 3000,
            title: "Will be closed after 3 seconds"
        }
    }]
}, {
    title: "Page size",
    props: [{
        $trigger: { title: "Open page loader", ttl: 3000 },
        props: {
            loading: true,
            ttl: 3000,
            title: "Will be closed after 3 seconds",
            size: "page"
        }
    }]
}];

window.EXAMPLES.UILoader = {
    constructor: "Elements.Various.UILoader",
    list: Examples
};