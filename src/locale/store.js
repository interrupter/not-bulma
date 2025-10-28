import { writable } from "svelte/store";

function initDict(target = {}) {
    const handler = {
        get: function (target, prop) {
            if (!Object.hasOwn(target, prop)) {
                return prop;
            }
            return Reflect.get(...arguments);
        },
    };
    return new Proxy(target, handler);
}

function createLocale() {
    //const { subscribe, set, update } = writable(initDict());
    const newLocale = writable(initDict());
    return {
        subscribe: newLocale.subscribe,
        update: newLocale.update,
        set: (val) => {
            newLocale.set(initDict(val));
        },
        reset: () => newLocale.set(initDict()),
    };
}

const LOCALE = createLocale();

export default LOCALE;
