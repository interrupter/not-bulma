import Lib from "../../lib.js";
import notCommon from "../../common";
import notBase from "../../base";

import UIFormSetComponent from "./form.set.svelte";
import UIFormComponent from "./form.svelte";

const DEFAULT_CONTAINER_SELECTOR = ".form-set";
const DEFAULT_FORM_SET_NAME = "form-set";

class notFormSet extends notBase {
    #formSetComponent = null;
    #formComponent = null;

    #form = null;
    #frame = null;

    /*
  new notFormSet({
    options:{
      target: el,
      forms: [{
        mode: 'form1',
        title: 'Form 1',
        form: formConstructor1 //custom constructors
      },{
        mode: 'form2',
        title: 'Form 2',
        props: {}             //params to create notForm instance
      },{
        mode: 'form3',
        title: 'Form 3',
        form: formConstructor3 //custom constructors
      }]
    }
  });
  */

    constructor({
        options = {},
        formComponent = UIFormComponent,
        formSetComponent = UIFormSetComponent,
    }) {
        super({
            options: {
                name: DEFAULT_FORM_SET_NAME,
                mode: "default",
                showModes: true,
                ...options,
            },
        });
        this.#formComponent = UIFormComponent;
        this.#formSetComponent = UIFormSetComponent;
        this.setFormMode(this.getOptions("mode"));
        this.initUI();
    }

    /**
     * Initalizing form frame mode, with switchers between modes
     **/
    initUI() {
        const target = this.getFrameTargetEl();
        while (target.children.length) target.removeChild(target.firstChild);
        this.#frame = new this.#formSetComponent({
            target,
            props: this.#getFrameProps(),
        });
        this.#frame.$on("mode", (ev) => {
            this.setFormMode(ev.detail);
            this.updateForm();
        });
        this.updateForm();
    }

    setFormMode(name) {
        if (this.isModeExists(name)) {
            this.setWorking("mode", name);
        } else {
            this.setWorking("mode", this.getFirstMode());
            this.updateFormModeInUI();
        }
    }

    updateFormModeInUI() {
        if (this.#frame && this.getWorking("mode") !== null) {
            this.#frame.$set({ mode: this.getWorking("mode") });
        }
    }

    getFormMode() {
        return this.getWorking("mode");
    }

    updateForm() {
        this.destroyForm();
        if (this.getWorking("mode") !== null) {
            this.renderForm();
        }
    }

    renderForm() {
        const targetEl = this.getFormTargetEl();
        const formConfig = this.getFormConfig();
        if (!(targetEl instanceof HTMLElement && formConfig)) {
            throw new Error("error while form rendering");
        }
        const changeMode = (mode) => {
            this.setFormMode(mode);
            this.updateForm();
        };
        if (formConfig.form) {
            while (targetEl.children.length)
                targetEl.removeChild(targetEl.firstChild);
            this.#form = new formConfig.form({
                options: { target: targetEl, changeMode },
            });
        } else if (formConfig.props) {
            this.#form = new this.#formComponent({
                target: targetEl,
                ...formConfig.props,
                changeMode,
            });
        }
    }

    getFormConfig() {
        return this.getOptions("forms").find(
            (form) => form.mode === this.getFormMode()
        );
    }

    destroyForm() {
        const containerEl = this.getFormTargetEl();
        if (containerEl) {
            while (containerEl.firstChild) {
                containerEl.removeChild(containerEl.lastChild);
            }
        }
        if (this.#form && this.#form.$destroy) {
            this.#form.$destroy();
        }
        this.#form = null;
    }

    destroyFrame() {
        if (this.#frame && this.#frame.$destroy) {
            this.#frame.$destroy();
        }
        this.#frame = null;
    }

    isModeExists(mode) {
        const forms = this.getOptions("forms", []);
        return forms.some((item) => item.mode === mode);
    }

    getFirstMode() {
        const forms = this.getOptions("forms", []);
        if (forms.length > 0) {
            return forms[0].mode;
        }
        return null;
    }

    destroy() {
        this.#formSetComponent = null;
        this.#formComponent = null;
        this.destroyForm();
        this.destroyFrame();
        thi.setData(null);
        thi.setOptions(null);
        thi.setWorking(null);
    }

    getFrameTargetEl() {
        const target = this.getOptions("target", DEFAULT_CONTAINER_SELECTOR);
        if (target instanceof HTMLElement) {
            return target;
        } else if (typeof target === "string") {
            return document.querySelector(target);
        } else {
            throw new Error("form set target is not HTMLElement or string");
        }
    }

    getFormTargetEl() {
        const name = this.getOptions("name", DEFAULT_FORM_SET_NAME);
        return document.querySelector(`#${name}-form-set-container`);
    }

    #getFrameProps() {
        return {
            showModes: this.getOptions("showModes", true),
            mode: this.getFormMode(),
            forms: this.getOptions("forms", []),
            name: this.getOptions("name", DEFAULT_FORM_SET_NAME),
        };
    }
}

export default notFormSet;
