class Lib {
    #lib = {};

    constructor(seedLib) {
        if (seedLib instanceof Lib) {
            this.import(seedLib.getContent());
        }
    }

    /**
     *
     * @params {string}  mode what to do if element exists [replace|add|skip]
     */
    add(name, comp, mode = "replace") {
        if (this.contains(name)) {
            if (mode === "replace") {
                this.#lib[name] = comp;
            } else if (mode === "add") {
                this.#lib[name] = Object.assign(this.#lib[name], comp);
            }
        } else {
            this.#lib[name] = comp;
        }
    }

    get(name) {
        return this.#lib[name];
    }

    contains(name) {
        return Object.hasOwn(this.#lib, name);
    }

    import(bulk, mode = "replace") {
        for (let f in bulk) {
            this.add(f, bulk[f], mode);
        }
    }

    isEmpty() {
        return Object.keys(this.#lib).length === 0;
    }

    getContent() {
        return {
            ...this.#lib,
        };
    }
}

export default Lib;
