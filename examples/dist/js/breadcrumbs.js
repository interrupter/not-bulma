/* global notBulma */
if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

import ValidatorsLib from "./forms/simple.validators.js";

const Examples = [
    {
        title: "notBreadcrumbs",
        description: "notBreadcrumbs",
        functions: true,
        props: [
            (target) => {
                console.log("rendering example for notBreadcrumbs", target);
                const breadcrumbs = notBulma.Frame.notBreadcrumbs.render({
                    target,
                    navigate: console.log,
                });
                breadcrumbs.setHead([
                    {
                        title: "Root",
                        url: false,
                    },
                    {
                        title: "Category",
                        url: "/category/url",
                    },
                ]);
                breadcrumbs.setTail([
                    {
                        title: "Item",
                        url: "/category/url/item/url",
                    },
                ]);
                breadcrumbs.update();
            },
        ],
    },
];

window.EXAMPLES.notBreadcrumbs = {
    constructor: "Frame.notBreadcrumbs",
    list: Examples,
};
