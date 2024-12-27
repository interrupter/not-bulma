/* global notBulma */
if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}
const { unmount } = notBulma.svelte;

const Examples = [
    {
        title: "Modal",
        props: [
            {
                $trigger: "size according content, button in bottom",
                props: {
                    closeButton: {
                        title: "Close",
                        outlined: true,
                        color: "danger",
                        onclick() {
                            const thisComp =
                                window.EXAMPLES_COMPONENTS_INSTANCES[
                                    "Elements.Modals.UIModal"
                                ][0][0];
                            unmount(thisComp);
                        },
                    },
                    applyButton: {
                        title: "Apply",
                        color: "success",
                        onclick() {
                            const thisComp =
                                window.EXAMPLES_COMPONENTS_INSTANCES[
                                    "Elements.Modals.UIModal"
                                ][0][0];
                            unmount(thisComp);
                        },
                    },
                    show: true,
                    class: "has-background-light",
                    subtitle: "some subtitle",
                    children(target) {
                        target.before(
                            document.createTextNode(
                                "Close by clicking on button"
                            )
                        );
                    },
                },
            },
            {
                $trigger: "fullscreen, buttons in top",
                props: {
                    closeButton: {
                        title: "Close",
                        outlined: true,
                        color: "danger",
                        onclick() {
                            const thisComp =
                                window.EXAMPLES_COMPONENTS_INSTANCES[
                                    "Elements.Modals.UIModal"
                                ][0][0];
                            unmount(thisComp);
                        },
                    },
                    applyButton: {
                        title: "Apply",
                        color: "success",
                        onclick() {
                            const thisComp =
                                window.EXAMPLES_COMPONENTS_INSTANCES[
                                    "Elements.Modals.UIModal"
                                ][0][0];
                            unmount(thisComp);
                        },
                    },
                    buttonsPosition: "top",
                    fullscreen: true,
                    show: true,
                    class: "has-background-light",
                    subtitle: "some subtitle",
                    children(target) {
                        target.before(
                            document.createTextNode(
                                "Close by clicking on button"
                            )
                        );
                    },
                },
            },
            {
                $trigger: "buttons in content area top",
                props: {
                    applyButton: {
                        title: "Apply",
                        color: "info",
                        outlined: true,
                        onclick() {
                            const thisComp =
                                window.EXAMPLES_COMPONENTS_INSTANCES[
                                    "Elements.Modals.UIModal"
                                ][0][0];
                            unmount(thisComp);
                        },
                    },
                    buttonsPosition: "topOfContent",
                    show: true,
                    class: "has-background-ghost",
                    subtitle: "some subtitle",
                    children(target) {
                        target.before(
                            document.createTextNode(
                                "Close by clicking on button"
                            )
                        );
                    },
                },
            },
        ],
    },
];

window.EXAMPLES.UIModal = {
    constructor: "Elements.Modals.UIModal",
    list: Examples,
};
