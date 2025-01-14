if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

class FakeService {
    static async openSelector() {
        const value = Math.random();
        return {
            _id: `${value}:_id`,
            title: `${value}:title`
        };
    }

    static async loadData(value) {
        return {
            _id: `${value}:_id`,
            title: `${value}:title`
        };
    }
}

const serviceGetter = () => FakeService;

const Examples = [{
    title: "Examples",
    props: [{
        icon: "search",
        serviceGetter,
        onchange({ field, value, data }) {
            console.log(field, value, data);
        }
    }]
}];

window.EXAMPLES.UISelectFromModelWithSearchModal = {
    constructor: "Elements.Various.UISelectFromModelWithSearchModal",
    list: Examples
};