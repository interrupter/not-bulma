if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

//import { createList } from "./examples.helpers";

const Examples = [{
    title: "Empty list",
    props: [{
        items: []
    }, {
        actions: [{
            id: 1,
            title: "list action 1",
            action(itemValue) {
                console.log("list action 1 ", itemValue);
            }
        }],
        items: [{
            id: 1,
            title: "item 1",
            value: "kellog"
        }, {
            id: 2,
            title: "item 2",
            value: "foo",
            actions: [{
                id: 1,
                title: "item action 2",
                action(itemValue) {
                    console.log("item action 2 ", itemValue);
                }
            }]
        }, {
            id: 3,
            title: "item 3",
            value: "krunchy",
            image: "/img/icon/logo/icon-32.png",
            description: "description"
        }]
    }]
}];

window.EXAMPLES.UIList = {
    constructor: "Elements.Lists.UIList",
    list: Examples
};