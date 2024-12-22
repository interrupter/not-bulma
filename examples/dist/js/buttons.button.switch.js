if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const ButtonsButtonSwitchExamples = [{
    title: "Simple",
    description: "Simple",
    props: [{
        title: "Button",
        uiOff: () => {
            return {
                title: "Button - OFF",
                color: ""
            };
        },
        uiOn: () => {
            return {
                title: "Button - ON",
                color: "success"
            };
        }
    }]
}, {
    title: "Icons",
    description: "Versions with icons",
    props: [{
        title: "",
        size: "medium",
        icon: "bold",
        uiOff: () => {
            return {
                size: "medium",
                color: "danger",
                icon: "skull-crossbones"
            };
        },
        uiOn: () => {
            return {
                size: "medium",
                color: "success",
                icon: "check"
            };
        }
    }]
}];

window.EXAMPLES.UIButtonSwitch = {
    constructor: "Elements.Buttons.UIButtonSwitch",
    list: ButtonsButtonSwitchExamples
};