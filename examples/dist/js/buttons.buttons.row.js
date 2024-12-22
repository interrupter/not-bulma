import { createExamplesSetForPropertyNameValues, addIndexField } from "./examples.helpers.js";

if (!window.EXAMPLES) {
    window.EXAMPLES = {};
}

const COLORS = addIndexField(createExamplesSetForPropertyNameValues({}, ["title", "color"], ["primary", "link", "info", "success", "warning", "danger"]));

const ButtonsButtonsExamples = [{
    title: "Левая колонка",
    description: "Только левая колонка",
    props: [{
        left: COLORS
    }]
}, {
    title: "Правая колонка",
    description: "Только правая колонка",
    props: [{
        right: COLORS
    }]
}, {
    title: "Центральная колонка",
    description: "Только центральная колонка",
    props: [{
        center: COLORS
    }]
}, {
    title: "Все колонки",
    description: "Задействованы все колонки",
    props: [{
        left: [COLORS[0]],
        center: [COLORS[1], COLORS[2]],
        right: [COLORS[3]]
    }]
}];
window.EXAMPLES.UIButtonsRow = {
    constructor: "Elements.Buttons.UIButtonsRow",
    list: ButtonsButtonsExamples
};