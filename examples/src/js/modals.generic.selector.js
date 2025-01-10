/* global notBulma */
if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}
import { createList } from "./examples.helpers.js";
const { unmount } = notBulma.svelte;
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
                        const thisComp =
                            window.EXAMPLES_COMPONENTS_INSTANCES[
                                "Elements.Modals.UIGenericSelector"
                            ][0][0];
                        unmount(thisComp);
                        window.EXAMPLES_COMPONENTS_INSTANCES[
                            "Elements.Modals.UIGenericSelector"
                        ][0].splice(0, 1);
                    },
                    onresolve({ id, _id, title }) {
                        console.log("resolve", id, _id, title);
                        const thisComp =
                            window.EXAMPLES_COMPONENTS_INSTANCES[
                                "Elements.Modals.UIGenericSelector"
                            ][0][0];
                        unmount(thisComp);
                        window.EXAMPLES_COMPONENTS_INSTANCES[
                            "Elements.Modals.UIGenericSelector"
                        ][0].splice(0, 1);
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
    constructor: "Elements.Modals.UIGenericSelector",
    list: Examples,
};
