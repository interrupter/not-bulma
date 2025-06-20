import "./scss/style.scss";

import * as svelte from "svelte";

import * as Elements from "./elements";

import * as Frame from "./frame";

import { LOCALE, say, notLocale } from "./locale";

const Locale = { LOCALE, say, notLocale };
const UICommon = Elements.UICommon;

const { notCommon, COMPONENTS, FIELDS, VARIANTS, notFormUtils } = Frame;

Object.keys(Elements).forEach((componentsSetName) => {
    Object.keys(Elements[componentsSetName]).forEach((componentName) => {
        Frame.notFormUtils.addComponent(
            componentName,
            Elements[componentsSetName][componentName]
        );
    });
});

export {
    svelte,
    //UI
    Elements,
    UICommon,
    //application framework
    Frame,
    //shorts for common elements
    notCommon,
    notFormUtils,
    COMPONENTS,
    FIELDS,
    VARIANTS,
    //localization
    Locale,
    LOCALE,
    say,
    notLocale,
};
