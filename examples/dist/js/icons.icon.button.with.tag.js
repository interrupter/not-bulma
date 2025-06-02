if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const Examples = [
    {
        title: "Simple",
        description: "Simple",
        props: [
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "warning",
                },
                left: "-1em",
            },
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "info",
                },
                left: "-1em",
                top: "-1em",
            },
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "danger",
                },
                top: "-1em",
            },
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "primary",
                },
                top: "-1em",
                right: "-1em",
            },
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "success",
                },

                right: "-1em",
            },
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "",
                },
                bottom: "-1em",
                right: "-1em",
            },
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "link",
                },
                bottom: "-1em",
            },
            {
                button: {
                    icon: "inbox",
                    color: "info",
                    outlined: true,
                    rounded: true,
                },
                tag: {
                    title: "12",
                    color: "warning",
                },
                bottom: "-1em",
                left: "-1em",
            },
        ],
    },
];

window.EXAMPLES.UIIconButtonWithTag = {
    constructor: "Elements.Icons.UIIconButtonWithTag",
    list: Examples,
};
