import notCommon from "../../common";
import notBase from "../../base";

import UICommon from "../../../elements/common.js";

import UIActionContainer from "./ui.action.container.svelte";
import UIAdapterSvelte from "../../ui.adapter.svelte";

const DEFAULT_CONTAINER_SELECTOR = ".container";
import { DEFAULT_STATUS_SUCCESS, DEFAULT_STATUS_ERROR } from "../../const";

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
            this.#ui = new UIAdapterSvelte(this.#uiComponent,
                target,
                this.getOptions(),
            );
        } catch (e) {
            this.error(e);
        }
    }

    setLoading() {
        this.emit("onloading");
        this.#ui.set('loaderActive', true);
        this.#ui.set('success', false);
        this.#ui.set('error', false);         
    }

    resetLoading() {
        this.emit("onloaded");
        this.#ui.set('loaderActive', false)
    }

    hideAll(){        
        this.#ui.set('loaderActive', false);
        this.#ui.set('success', false);
        this.#ui.set('error', false);   
    }

    destroy() {
        this.emit("ondestroy");
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

    showSuccess(title, message) {        
        this.#ui.set('success', true);
        this.#ui.set('error', false);           
        if (message != undefined) {
            this.#ui.set('successMessage', message);
        }
        if (title != undefined) {
            this.#ui.set('successTitle', title);            
        }
    }

    showError(title, message) {
        this.#ui.set('success', false);
        this.#ui.set('error', true);           
        if (message != undefined) {
            this.#ui.set('errorMessage', message);
        }
        if (title != undefined) {
            this.#ui.set('errorTitle', title);            
        }       
    }

    /**
     *   Form validation result
     **/
    setFormSuccess() {
        this.showSuccess();
        this.emit("onsuccess");
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
        this.showError(result.message, JSON.stringify(status, null, 4));
        this.emit("onerror", status);
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
