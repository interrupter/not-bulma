if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const INIT_OBJ = {
    LC_TRUE: "Да",
    LC_FALSE: "Нет"
};

const Examples = [{
    title: "Default",
    description: "none",
    props: [{
        onchange({ value, field }, event) {
            console.log(field, value, event);
        }
    }]
}, {
    title: "More options",
    description: "none",
    props: [{
        placeholder: "search without icon...",
        fieldname: "simple-search-field-1",
        onchange: ({ value, field }, event) => console.log(field, value, event),
        icon: "",
        size: "small"
    }, {
        placeholder: "search for...",
        fieldname: "simple-search-field-2",
        onchange: ({ value, field }, event) => console.log(field, value, event),
        icon: "user",
        size: "normal",

        iconSide: "right"
    }, {
        placeholder: "search for...",
        fieldname: "simple-search-field-3",
        onchange: ({ value, field }, event) => console.log(field, value, event),
        icon: "search",
        size: "large",
        iconSide: "left"
    }]
}];

window.EXAMPLES.UISimpleSearchInput = {
    constructor: "Elements.Various.UISimpleSearchInput",
    list: Examples
};