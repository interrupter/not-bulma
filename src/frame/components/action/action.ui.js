import notBase from "../../base";

import UIActionContainer from "./ui.action.container.svelte";
const DEFAULT_CONTAINER_SELECTOR = ".container";
import { DEFAULT_STATUS_SUCCESS } from "../../const";

class notActionUI extends notBase {
    //UI renderer component class constructor
    #uiComponent = null;
    #ui = null;

    constructor({
        target = null,
        name = "Default",
        options = {},
        working = {},
        data = {},
        ui = UIActionContainer, //default UI
    }) {
        super({
            working: {
                name: `${name}ActionUI`,
                ...working,
            },
            options,
            data,
        });
        if (target) {
            this.setOptions("target", target);
        }
        this.#uiComponent = ui;
        this.initUI();
    }

    initUI() {
        try {
            const target = this.getTargetEl();
            while (target.children.length)
                target.removeChild(target.firstChild);
            this.#ui = new this.#uiComponent({
                target,
                props: this.getOptions(),
            });
        } catch (e) {
            this.error(e);
        }
    }

    setLoading() {
        this.emit("loading");
        this.#ui.setLoading();
    }

    resetLoading() {
        this.emit("loaded");
        this.#ui.resetLoading();
    }

    destroy() {
        this.emit("destroy");
        if (this.#ui) {
            this.#ui.$destroy && this.#ui.$destroy();
            this.#ui.destroy && this.#ui.destroy();
            this.#ui = null;
        }
        this.setOptions(null);
        this.setWorking(null);
        this.setData(null);
    }

    processResult(result) {
        if (result.status === DEFAULT_STATUS_SUCCESS) {
            this.setFormSuccess();
            return true;
        } else {
            this.setFormErrors(result);
            return false;
        }
    }

    /**
     *   Form validation result
     **/
    setFormSuccess() {
        this.#ui.showSuccess();
        this.emit("success");
    }

    setFormErrors(result) {
        const status = {
            form: [],
            fields: {},
        };
        if (result.message) {
            status.form.push(result.message);
        }
        if (result.errors && Object.keys(result.errors).length > 0) {
            status.fields = { ...result.errors };
        }
        this.#ui.showError(status);
        this.emit("error", status);
    }

    /***
     * Redefinable getters
     **/
    getTargetEl() {
        const targetEl = this.getOptions("target", DEFAULT_CONTAINER_SELECTOR);
        if (targetEl instanceof HTMLElement) {
            return targetEl;
        } else if (typeof targetEl === "string") {
            return document.querySelector(targetEl);
        } else {
            throw new Error("ActionUI parent element is not defined");
        }
    }
}

export default notActionUI;
