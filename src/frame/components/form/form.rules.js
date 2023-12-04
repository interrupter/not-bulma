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
        if (!notCommon.objHas(this.#RULES, name)) {
            this.#RULES[name] = func;
        }
    }

    static remove(name) {
        if (
            notCommon.objHas(this.#RULES, name) &&
            !Object.keys(DEFAULT_RULES).includes(name)
        ) {
            delete this.#RULES[name];
        }
    }

    static exec(rule, master, slaves, value, form) {
        return this.#RULES[rule](value, master, slaves, form);
    }
}
