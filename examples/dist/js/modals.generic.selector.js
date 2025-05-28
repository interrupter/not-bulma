if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}
import { createList, demandUnmount } from "./examples.helpers.js";
const constructorName = "Elements.Modals.UIGenericSelector";

const Examples = [
    {
        title: "Default",
        props: [
            {
                $trigger: "default",
                props: {
                    showSearch: false,
                    onchange({ field, value }, ev) {
                        console.log(field, value, ev);
                    },
                    onreject() {
                        demandUnmount(constructorName, 0, 0);
                    },
                    onresolve({ id, _id, title }) {
                        console.log("resolve", id, _id, title);
                        demandUnmount(constructorName, 0, 0);
                    },
                    results: {
                        list: createList((i) => {
                            return {
                                id: i,
                                _id: i,
                                title: `Item number - ${i + 1}`,
                            };
                        }, 10),
                        count: 20,
                        page: 0,
                        pages: 2,
                    },
                    rejectButtonProps: {
                        color: "warning",
                    },
                },
            },
            {
                $trigger: "with custom itemRenderer, see actual sources",
                props: {
                    itemRenderer(target, item, id) {
                        const el = document.createElement("DIV");
                        el.innerText = `${id()} - ${item().title}`;
                        el.style.cursor = "pointer";
                        el.onclick = () => {
                            console.log("selected variant", item());
                            demandUnmount(constructorName, 0, 1);
                        };
                        target.before(el);
                    },
                    showSearch: false,
                    onchange({ field, value }, ev) {
                        console.log(field, value, ev);
                    },
                    onreject() {
                        demandUnmount(constructorName, 0, 1);
                    },
                    onresolve({ id, _id, title }) {
                        console.log("resolve", id, _id, title);
                        demandUnmount(constructorName, 0, 1);
                    },
                    results: {
                        list: createList((i) => {
                            return {
                                id: i,
                                _id: i,
                                title: `Item number - ${i + 1}`,
                            };
                        }, 10),
                        count: 20,
                        page: 0,
                        pages: 2,
                    },
                    rejectButtonProps: {
                        color: "warning",
                    },
                },
            },
        ],
    },
];

window.EXAMPLES.UIGenericSelector = {
    constructor: constructorName,
    list: Examples,
};
