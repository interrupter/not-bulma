/* global notBulma */

const { notSideMenu, notTopMenu, COMPONENTS } = notBulma.Frame;
const { mount } = notBulma.svelte;

import menu from "./menu.js";

function initMenu() {
    COMPONENTS.add(notBulma.Elements.Various.UIProgress);
    notSideMenu.setOptions({
        items: menu.side.items ? menu.side.items : [],
        sections: menu.side.sections ? menu.side.sections : []
    });
    notSideMenu.render();
    notTopMenu.setOptions({
        root: "http://" + window.location.host,
        brand: {
            url: "./index.html",
            icon: {
                src: "/img/icon/logo/icon-32.png",
                width: 32,
                height: 32
            }
        },
        items: menu.top.items ? menu.top.items : [],
        sections: menu.top.sections ? menu.top.sections : []
    });
    notTopMenu.render();
}

function getConstructor(path) {
    return notBulma.Frame.notPath.get(path, notBulma);
}

function initExamplesSetHTML(id, val, constructorPath) {
    let cont = document.querySelector("#examples");
    let box = document.createElement("div");
    box.classList.add("box");
    box.id = "examples-set-" + id;
    cont.appendChild(box);
    let title = document.createElement("h3");
    title.classList.add("title");
    title.classList.add("is-4");
    title.classList.add("is-4");
    title.innerHTML = val.title;
    box.appendChild(title);
    let description = document.createElement("div");
    description.classList.add("content");
    description.innerHTML = typeof val.description !== "undefined" ? val.description : "";
    box.appendChild(description);
    let cols = document.createElement("div");
    cols.classList.add("columns");
    box.appendChild(cols);
    let elements = document.createElement("div");
    elements.classList.add("column");
    cols.appendChild(elements);
    let pre = document.createElement("pre");
    pre.classList.add("column");
    if (val.functions) {
        pre.innerHTML = val.props.map(f => f.toString()).join("<br/>");
    } else {
        const propsStringified = val.props.map(currentProps => {
            const currentPropsStringified = {};
            Object.keys(currentProps).forEach(propName => {
                if (typeof currentProps[propName] === "function") {
                    currentPropsStringified[propName] = currentProps[propName].toString();
                } else {
                    currentPropsStringified[propName] = currentProps[propName];
                }
            });
            return currentPropsStringified;
        });
        pre.innerHTML = JSON.stringify(propsStringified, null, 4);
    }
    cols.appendChild(pre);
    val.props.forEach((props, i) => {
        let example = document.createElement("div");
        example.classList.add("column");
        example.id = `example-${id}-${i}`;
        elements.appendChild(example);
        if (typeof props === "function") {
            props(example);
        } else {
            const Constructor = getConstructor(constructorPath);
            mount(Constructor, {
                target: example,
                props
            });
        }
    });
}

function initExamples() {
    if (window.EXAMPLES_SELECTED && Object.prototype.hasOwnProperty.call(window.EXAMPLES, window.EXAMPLES_SELECTED)) {
        const examplesSet = window.EXAMPLES[window.EXAMPLES_SELECTED];
        for (let exampleDataID in examplesSet.list) {
            initExamplesSetHTML(exampleDataID, examplesSet.list[exampleDataID], examplesSet.constructor);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log(menu);
    console.log(Object.keys(notBulma));
    initMenu();
    if (window.EXAMPLES) {
        console.log(window.EXAMPLES_SELECTED);
        console.log(Object.keys(window.EXAMPLES));
        initExamples();
    }
});