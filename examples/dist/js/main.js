/* global notBulma */

const { notSideMenu, notTopMenu, COMPONENTS } = notBulma.Frame;
const { mount, unmount } = notBulma.svelte;

import menu from "./menu.js";

window.EXAMPLES_COMPONENTS_INSTANCES = {};

function initMenu() {
    COMPONENTS.add(notBulma.Elements.Various.UIProgress);
    notSideMenu.setOptions({
        items: menu.side.items ? menu.side.items : [],
        sections: menu.side.sections ? menu.side.sections : [],
    });
    notSideMenu.render();
    notTopMenu.setOptions({
        root: "http://" + window.location.host,
        brand: {
            url: "./index.html",
            icon: {
                src: "/img/icon/logo/icon-32.png",
                width: 32,
                height: 32,
            },
        },
        items: menu.top.items ? menu.top.items : [],
        sections: menu.top.sections ? menu.top.sections : [],
    });
    notTopMenu.render();
}

function getConstructor(path) {
    return notBulma.Frame.notPath.get(path, notBulma);
}

function renderTrigger(target, title, callback) {
    const btn = document.createElement("BUTTON");
    btn.onclick = callback;
    btn.innerText = title;
    btn.classList.add("button");
    target.appendChild(btn);
}

function buildExample(example, props, instances, constructorPath, val) {
    if (typeof props === "function") {
        return props(example);
    } else {
        const Constructor = getConstructor(constructorPath);
        const compInstance = mount(Constructor, {
            target: val.wrapperTargetSelector
                ? example.querySelector(val.wrapperTargetSelector)
                : example,
            props,
        });
        instances.push(compInstance);
        return compInstance;
    }
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
    description.innerHTML =
        typeof val.description !== "undefined" ? val.description : "";
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
        pre.innerHTML = val.props.map((f) => f.toString()).join("<br/>");
    } else {
        const propsStringified = val.props.map((currentProps) => {
            const currentPropsStringified = {};
            Object.keys(currentProps).forEach((propName) => {
                if (typeof currentProps[propName] === "function") {
                    currentPropsStringified[propName] =
                        currentProps[propName].toString();
                } else {
                    currentPropsStringified[propName] = currentProps[propName];
                }
            });
            return currentPropsStringified;
        });
        pre.innerHTML = JSON.stringify(propsStringified, null, 4);
    }
    cols.appendChild(pre);
    const instances = [];
    val.props.forEach((props, i) => {
        let example = document.createElement("div");
        example.classList.add("column");
        example.id = `example-${id}-${i}`;
        if (val.wrapper) {
            example.innerHTML = val.wrapper;
        }
        elements.appendChild(example);
        if (Object.hasOwn(props, "$trigger") && props.$trigger) {
            renderTrigger(
                example,
                props.$trigger?.title ?? props.$trigger,
                () => {
                    const compInst = buildExample(
                        example,
                        props?.props ?? {},
                        instances,
                        constructorPath,
                        val
                    );
                    if (props.$trigger?.ttl) {
                        setTimeout(
                            () => unmount(compInst),
                            props.$trigger?.ttl
                        );
                    }
                }
            );
        } else {
            buildExample(example, props, instances, constructorPath, val);
        }
    });
    if (!Array.isArray(window.EXAMPLES_COMPONENTS_INSTANCES[constructorPath])) {
        window.EXAMPLES_COMPONENTS_INSTANCES[constructorPath] = [];
    }
    window.EXAMPLES_COMPONENTS_INSTANCES[constructorPath].push(instances);
}

function initExamples() {
    if (
        window.EXAMPLES_SELECTED &&
        Object.prototype.hasOwnProperty.call(
            window.EXAMPLES,
            window.EXAMPLES_SELECTED
        )
    ) {
        const examplesSet = window.EXAMPLES[window.EXAMPLES_SELECTED];
        for (let exampleDataID in examplesSet.list) {
            initExamplesSetHTML(
                exampleDataID,
                examplesSet.list[exampleDataID],
                examplesSet.constructor
            );
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log(menu);
    console.log(Object.keys(notBulma));
    initMenu();
    fetch("/assets/ru.json")
        .then((resp) => resp.json())
        .then((locale) => {
            let prefixed = {};
            Object.keys(locale).forEach((phrase) => {
                prefixed[`not-node:${phrase}`] = locale[phrase];
            });
            return prefixed;
        })
        .then((dict) => notBulma.notLocale.set(dict));
    if (window.EXAMPLES) {
        console.log(window.EXAMPLES_SELECTED);
        console.log(Object.keys(window.EXAMPLES));
        initExamples();
    }
});
