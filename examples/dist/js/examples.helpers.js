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
