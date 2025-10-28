/* global  structuredClone, notBulma */
const { unmount } = notBulma.svelte;

export function createExamplesSetForPropertyNameValues(
    obj,
    propertyName,
    values
) {
    return values.map((value) => {
        const itm = {
            ...structuredClone(obj),
        };
        if (typeof propertyName == "string") {
            itm[propertyName] = value;
        } else if (Array.isArray(propertyName)) {
            propertyName.forEach((propName) => {
                itm[propName] = value;
            });
        }
        return itm;
    });
}

export function createExamplesSetForMutations(obj, mutations) {
    return mutations.map((mutation) => {
        return {
            ...structuredClone(obj),
            ...mutation,
        };
    });
}

export function addIndexField(list, fieldName = "id", startFrom = 0) {
    return list.map((itm, index) => {
        itm[fieldName] = startFrom + index;
        return itm;
    });
}

function createChildrenSnippetTextNode(text) {
    return (target) => {
        target.before(document.createTextNode(text));
        return target;
    };
}

export function createInnerTextNodeSnippet(text) {
    return {
        children: createChildrenSnippetTextNode(text),
    };
}

export function createList(itemGenerator, count = 10) {
    let result = [];
    for (let i = 0; i < count; i++) {
        result.push(itemGenerator(i));
    }
    return result;
}

export function createExampleId(setId, itemId) {
    return `example-${setId}-${itemId}`;
}

export function getComponentInstance(constructorName, setNumber, itemNumber) {
    return window.EXAMPLES_COMPONENTS_INSTANCES[constructorName][
        createExampleId(setNumber, itemNumber)
    ];
}

export function getDeleteComponentInstance(
    constructorName,
    setNumber,
    itemNumber
) {
    delete window.EXAMPLES_COMPONENTS_INSTANCES[constructorName][
        createExampleId(setNumber, itemNumber)
    ];
}

export function demandMount() {}

export function demandUnmount(constructorName, setNumber, itemNumber) {
    const thisComp = getComponentInstance(
        constructorName,
        setNumber,
        itemNumber
    );
    unmount(thisComp);
    getDeleteComponentInstance(constructorName, setNumber, itemNumber);
}
