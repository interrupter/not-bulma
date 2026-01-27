import { Runner } from "not-validation";

import { VARIANTS } from "../../LIB.js";
import Lib from "../../lib.mjs";
import notCommon from "../../common";
import notBase from "../../base";

import UICommon from "../../../elements/common.js";
import FormHelpers from "./form.helpers.js";
import UIFormComponent from "./form.svelte";
import notFormRules from "./form.rules.js";

import { DEFAULT_STATUS_SUCCESS } from "../../const";

const DEFAULT_CONTAINER_SELECTOR = ".form";
const DEFAULT_ACTION_NAME = "default";

class notForm extends notBase {
    //UI renderer component class constructor
    #uiComponent = null;
    //form validation
    #validationRunner = null;
    //ui component
    #form = null;
    //model.action
    #action = DEFAULT_ACTION_NAME;
    //fields schemas
    #fields = new Lib(); //fields of UI
    //variants sets for select menus and so on
    #variants = null; //variants for UI

    constructor({
        target = null,
        name = "Default",
        options = {},
        working = {},
        data = {},
        ui = UIFormComponent, //default UI
    }) {
        super({
            working: {
                name: `${name}Form`,
                ...working,
            },
            options,
            data,
        });
        this.#variants = new Lib(VARIANTS.getContent());
        if (target) {
            this.setOptions("target", target);
        }
        this.#uiComponent = ui;
        if (notCommon.objHas(options, "action")) {
            this.#action = options.action;
        }
        this.initForm();
    }

    initForm() {
        if (this.getOptions("autoInit", true)) {
            this.initLibs();
        }
        if (this.getOptions("autoRender", true)) {
            this.initUI();
        }
    }

    initLibs() {
        this.initFields();
        this.initVariants();
        this.initValidator();
    }

    reInit() {
        this.initLibs();
        this.updateUI();
        this.resetLoading();
    }

    initFields() {
        const manifest = this.getFormManifest();
        if (notCommon.objHas(manifest, "fields") && this.#fields.isEmpty()) {
            this.#fields.import(manifest.fields); //all fields available in model manifest
        }
    }

    initVariants() {
        if (this.getOptions("variants")) {
            this.#variants.import(this.getOptions("variants"));
        }
    }

    //creating validators runner for this specific form
    initValidator() {
        this.#validationRunner = Runner(this.getFormValidators());
    }

    initUI() {
        try {
            const props = this.#getFormProps({
                manifest: this.getFormManifest(),
                formOptions: this.getFormOptions(),
                data: this.getFormData(),
                injectedProps: this.getFormInjectedProps(),
            });
            const target = this.getFormTargetEl();
            while (target.children.length)
                target.removeChild(target.firstChild);
            this.#form = new this.#uiComponent({
                target,
                props,
            });
            this.#bindUIEvents();
            this.validateForm();
        } catch (e) {
            this.error(e);
        }
    }

    updateUI() {
        try {
            const props = this.#getFormProps({
                manifest: this.getFormManifest(),
                formOptions: this.getFormOptions(),
                data: this.getFormData(),
                injectedProps: this.getFormInjectedProps(),
            });
            this.#form.$set(props);
            this.validateForm();
        } catch (e) {
            this.error(e);
        }
    }

    #bindUIEvents() {
        this.#form.$on("change", () => this.validateForm());
        this.#form.$on("change", (ev) => {
            this.emit("change", ev.detail);
            this.emit(`change.${ev.detail.field}`, ev.detail.value);
        });
        this.#form.$on("submit", (ev) => this.submit(ev.detail));
        this.#form.$on("reject", () => this.reject());
        this.#form.$on("error", ({ detail }) => this.emit("error", detail));
        this.#bindMasterSlaveEvents();
    }

    #bindMasterSlaveEvents() {
        const masters = this.getOptions("masters", false);
        if (!masters) {
            return;
        }
        for (let master in masters) {
            const rules = masters[master];
            for (let ruleName in rules) {
                const ruleSlaves = rules[ruleName];
                this.#addMasterSlaveEvents(ruleName, master, ruleSlaves);
            }
        }
    }

    #addMasterSlaveEvents(rule, master, slaves = []) {
        this.on(`change.${master}`, (value) => {
            this.#execSlaveRule(rule, master, slaves, value);
        });
        this.emit(`change.${master}`, this.getFormData()[master]);
    }

    #execSlaveRule(rule, master, slaves, value) {
        const cmd = notFormRules.exec(rule, master, slaves, value, this);
        slaves.forEach((slaveField) => {
            this.updateField(slaveField, cmd);
        });
    }

    async validateForm() {
        if (this.getOptions("readonly", false)) {
            return;
        }
        try {
            const validationResult = await this.#validationRunner(
                this.#form.collectData(),
                this.getFormAction()
            );
            this.#form.updateFormValidationStatus(validationResult.getReport());
            if (!validationResult.clean) {
                this.emit("error", validationResult.getReport());
            }
        } catch (e) {
            const report = {
                form: [UICommon.ERROR_DEFAULT, e.message],
            };
            this.#form && this.#form.updateFormValidationStatus(report);
            this.emit("error", report);
            notCommon.report(e);
        }
    }

    submit(data) {
        this.emit("submit", data);
    }

    reject() {
        this.emit("reject");
    }

    //binding event to actual UI
    $on() {
        if (this.#form) {
            this.#form.$on(...arguments);
        }
    }

    setLoading() {
        this.emit("loading");
        this.#form.setLoading();
    }

    resetLoading() {
        this.emit("loaded");
        this.#form.resetLoading();
    }

    destroy() {
        this.emit("destroy");
        if (this.#form) {
            this.#form.$destroy && this.#form.$destroy();
            this.#form.destroy && this.#form.destroy();
            this.#form = null;
        }
        this.#validationRunner = null;
        this.#action = null;
        this.#fields = null;
        this.#variants = null;
        this.setOptions(null);
        this.setWorking(null);
        this.setData(null);
    }

    #getFormProps({
        manifest, //model manifest
        formOptions = {
            ui: {},
            fields: {},
        }, //some options
        data = null, //initial data for form
        injectedProps = {},
    }) {
        const action = this.#action;
        if (typeof formOptions === "undefined" || formOptions === null) {
            formOptions = {
                ui: {},
                fields: {},
            };
        }

        const form = FormHelpers.initFormByField(
            //form seed object
            {},
            /*
      Form structure
      [
        //each item is line of form
        //field - field takes whole line of form
        //[field1, field2] - few fields in one line
        nameFirst, nameLast
        [age, country, language],
        [email, telephone]
      ]
      */
            manifest.actions[action].fields, //form fields structure
            this.#variants, //variants library
            this.#fields, //fields library
            formOptions.fields, //form wide fields options
            data
        );

        return {
            //if no auto init of form structure, set to loading state
            loading: !this.getOptions("autoInit", true),
            title: manifest.actions[action].title,
            description: manifest.actions[action].description,
            fields: manifest.actions[action].fields,
            form,
            //injecting options to UI from top level input
            ...formOptions.ui, //form UI options
            ...injectedProps,
        };
    }

    getName() {
        return this.getWorking("name");
    }

    getFormAction() {
        return this.#action;
    }

    setFormAction(val) {
        if (val && val !== this.#action) {
            this.#action = val;
            this.#form && this.#form.$destroy();
            this.initForm();
        }
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
        this.#form.showSuccess();
        this.emit("success");
    }

    setFormErrors(result) {
        if (this.getOptions("readonly", false)) {
            return;
        }
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
        this.#form.updateFormValidationStatus(status);
        this.emit("error", status);
    }

    /**
     * Returns variant by collection name and item id
     * @param {string}         name  name of the variants collection
     * @param {string|number}  id    item identificator
     * @returns {object}             item
     **/
    getVariant(name, id) {
        let lib = this.#variants.get(name);
        let result = lib.find((item) => item.id === id);
        if (result) {
            return result;
        }
        return null;
    }

    /***
     * Redefinable getters
     **/

    getFormTargetEl() {
        const targetEl = this.getOptions("target", DEFAULT_CONTAINER_SELECTOR);
        if (targetEl instanceof HTMLElement) {
            return targetEl;
        } else if (typeof targetEl === "string") {
            return document.querySelector(targetEl);
        } else {
            throw new Error("Form parent element is not defined");
        }
    }

    getFormValidators() {
        if (this.getOptions("validators")) {
            return this.getOptions("validators", {});
        } else {
            this.#missingOverrideWarning("validators");
            return {};
        }
    }

    getFormManifest() {
        const modelName = this.getModelName();
        if (modelName && notCommon.getApp()) {
            return notCommon.getApp().getInterfaceManifest(modelName);
        }
        if (this.getOptions("manifest", undefined)) {
            return this.getOptions("manifest", {});
        } else {
            this.#missingOverrideWarning("manifest");
            return {};
        }
    }

    getFormData() {
        if (this.getData()) {
            return this.getData();
        } else {
            this.#missingOverrideWarning("data");
            return {};
        }
    }

    getFormOptions() {
        if (
            this.getOptions("ui", undefined) ||
            this.getOptions("fields", undefined)
        ) {
            return {
                ui: this.getOptions("ui", {}),
                fields: this.getOptions("fields", {}),
            };
        } else {
            this.#missingOverrideWarning("options");
            return {
                ui: {},
                fields: {},
            };
        }
    }

    getFormInjectedProps() {
        return this.getOptions("injected", {});
    }

    /**
     * Override empty message
     **/
    #missingOverrideWarning(missing) {
        this.error(
            `${missing} for ${this.getWorking("name")} form is not defined`
        );
    }

    /**
     * Form operations
     **/
    collectData() {
        if (this.getOptions("readonly", false)) {
            return this.getData();
        }
        const data = this.#form.collectData();
        this.setData({ ...data }); //update in inner store
        return data;
    }

    updateField(fieldName, props) {
        this.#form.updateField(fieldName, props);
    }

    getModel(name, data) {
        if (typeof name === "string") {
            return this.getInterface(name)(data || {});
        } else {
            return this.getInterface()(name || {});
        }
    }

    getInterface(name = false) {
        return notCommon.getApp().getInterface(name || this.getModelName());
    }

    /**
     *  Returns current model name
     *  @return {string}
     */
    getModelName() {
        return this.getOptions("model");
    }
}

export default notForm;
