if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}
import { demandUnmount } from "./examples.helpers.js";

const constructorName = "Elements.Modals.UIModal";

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
                            demandUnmount(constructorName, 0, 0);
                        },
                    },
                    applyButton: {
                        title: "Apply",
                        color: "success",
                        onclick() {
                            demandUnmount(constructorName, 0, 0);
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
                            demandUnmount(constructorName, 0, 1);
                        },
                    },
                    applyButton: {
                        title: "Apply",
                        color: "success",
                        onclick() {
                            demandUnmount(constructorName, 0, 1);
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
                            demandUnmount(constructorName, 0, 2);
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
    constructor: constructorName,
    list: Examples,
};
