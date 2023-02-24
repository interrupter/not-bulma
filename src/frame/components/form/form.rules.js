const DEFAULT_RULES = {
    notReadonly(v) {
        return {
            readonly: !v,
        };
    },
    readonly(v) {
        return {
            readonly: v,
        };
    },
    enable(v) {
        return {
            disabled: !v,
        };
    },
    disable(v) {
        return {
            disabled: v,
        };
    },
};

export default class notFormRules {
    static #RULES = { ...DEFAULT_RULES };

    static add(name, func) {
        if (!Object.hasOwn(this.#RULES, name)) {
            this.#RULES[name] = func;
        }
    }

    static remove(name) {
        if (
            Object.hasOwn(this.#RULES, name) &&
            !Object.keys(DEFAULT_RULES).includes(name)
        ) {
            delete this.#RULES[name];
        }
    }

    static exec(name, value) {
        return this.#RULES[name](value);
    }
}
