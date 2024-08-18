import UICommon from "../../elements/common";
import { say } from "../../locale";

import notBreadcrumbs from "../components/breadcrumbs";

import UILoader from "../../elements/various/ui.loader.svelte";

import notController from "../controller";
import notCommon from "../common";

import CRUDVariantsPreloader from "./variants.preloader.js";
import CRUDRouter from "./router.js";
import CRUDMessage from "./message.js";
import CRUDActions from "./actions";

const BREADCRUMBS = [];
const TITLE_FIELDS_PRIORITY = ["title", "label", "id", "name"];

class notCRUD extends notController {
    #actions = { ...CRUDActions };
    #router = CRUDRouter;
    #preloader = CRUDVariantsPreloader;

    TITLE_FIELDS_PRIORITY = TITLE_FIELDS_PRIORITY;

    static ERROR_DEFAULT = UICommon.ERROR_DEFAULT;

    TOP_CLASS = ["box"];
    MAIN_CLASS = ["box"];
    BOTTOM_CLASS = ["box"];

    WS_CHECK_INTERVAL = 200;

    constructor(
        app,
        name,
        { actions, router, preloader } = {
            actions: undefined,
            router: undefined,
            preloader: undefined,
        }
    ) {
        super(app, `CRUD.${name}`);
        if (actions) {
            // @ts-ignore
            this.#actions = { ...this.#actions, ...actions };
        }
        if (router) {
            this.#router = router;
        }
        if (preloader) {
            this.#preloader = preloader;
        }
        this.ui = {};
        this.els = {};
        this.setOptions("names", {
            module: "",
            plural: "plural",
            single: "single",
        });
        this.setOptions(
            "containerSelector",
            this.app?.getOptions("crud.containerSelector")
        );
        this.buildFrame();
        return this;
    }

    setValidators(validators) {
        //not-module-name -> [not,module,name]
        const ModuleNameParts = this.MODULE_NAME.split("-");
        //[not,module,name] -> ModuleName
        const ModuleName = (
            ModuleNameParts[0] === "not"
                ? ModuleNameParts.splice(1)
                : ModuleNameParts
        )
            .map(notCommon.capitalizeFirstLetter)
            .join("");
        const serviceName = `ns${ModuleName}Common`;
        const CommonModuleService = this.app?.getService(serviceName);
        this.setWorking(
            "validators",
            CommonModuleService.augmentValidators(validators)
        );
    }

    getValidators() {
        return this.getWorking("validators");
    }

    start() {
        let newHead = [];
        if (this.getModuleName() && this.getOptions("names.module")) {
            newHead.push({
                title: this.getOptions("names.module"),
                url: false,
            });
        }
        newHead.push({
            title: this.getOptions("names.plural"),
            url: this.getModelURL(),
        });
        BREADCRUMBS.splice(0, BREADCRUMBS.length, ...newHead);
        notBreadcrumbs.setHead(BREADCRUMBS).render({
            root: "",
            target: this.els.top,
            navigate: (url) => this.app?.getWorking("router").navigate(url),
        });
        this.route(this.getOptions("params"));
    }

    startWhenWSClientReady() {
        if (this.app?.getWSClient()) {
            if (this.app?.getWSClient().isConnected()) {
                this.start();
            } else {
                this.app
                    .getWSClient()
                    .once("connected", this.startWhenWSClientReady.bind(this));
            }
        } else {
            setTimeout(
                () => this.startWhenWSClientReady(),
                this.WS_CHECK_INTERVAL
            );
        }
    }

    setBreadcrumbs(tail) {
        notBreadcrumbs.setTail(tail).update();
    }

    backToList() {
        this.navigate(this.linkBackToList());
    }

    linkBackToList() {
        return this.getModelURL();
    }

    afterAction(action = "list") {
        let navBack = this.app?.getOptions("crud.navigateBackAfter", []);
        if (navBack && Array.isArray(navBack) && navBack.indexOf(action) > -1) {
            window.history.back();
        } else {
            this.backToList();
        }
    }

    buildFrame() {
        let el = document.querySelector(
            this.app?.getOptions("crud.containerSelector", "body")
        );
        while (el.firstChild) {
            el.removeChild(el.firstChild);
        }
        this.els.top = document.createElement("div");
        this.els.top.id = "crud-top";
        this.getFrameClasses().TOP_CLASS.forEach((name) =>
            this.els.top.classList.add(name)
        );
        el.appendChild(this.els.top);
        this.els.main = document.createElement("div");
        this.els.main.id = "crud-main";
        this.getFrameClasses().MAIN_CLASS.forEach((name) =>
            this.els.main.classList.add(name)
        );
        el.appendChild(this.els.main);
        this.els.bottom = document.createElement("div");
        this.els.bottom.id = "crud-bottom";
        this.getFrameClasses().BOTTOM_CLASS.forEach((name) =>
            this.els.bottom.classList.add(name)
        );
        el.appendChild(this.els.bottom);
    }

    getFrameClasses() {
        return {
            TOP_CLASS: this.TOP_CLASS,
            MAIN_CLASS: this.MAIN_CLASS,
            BOTTOM_CLASS: this.BOTTOM_CLASS,
        };
    }

    getContainerTopElement() {
        return this.els.top;
    }

    getContainerInnerElement() {
        return this.els.main;
    }

    getContainerBottomElement() {
        return this.els.bottom;
    }

    async preloadVariants(type = "list") {
        await this.#preloader.preload(this, type);
    }

    getTitleFromLib(propName, id) {
        throw new Error("not suported anymore");
        //return Form.getVariant(propName, id).title;
    }

    getItemTitle(item) {
        const fieldName = this.TITLE_FIELDS_PRIORITY.find((key) =>
            notCommon.objHas(item, key)
        );
        if (fieldName) {
            return item[fieldName];
        } else {
            return "";
        }
    }

    createDefault() {
        let newRecord = this.getModel({
            _id: null,
            title: say(this.getOptions("names.single")),
            products: [],
        });
        return newRecord;
    }

    route(params = []) {
        try {
            return this.#router.route(this, params);
        } catch (e) {
            this.report(e);
            this.showErrorMessage(e);
        }
    }

    actionHandlerExists(actionName) {
        if (Object.keys(this.#actions).includes(actionName)) {
            return true;
        }
        if (
            typeof this["run" + notCommon.capitalizeFirstLetter(actionName)] ===
            "function"
        ) {
            return true;
        }
        return false;
    }

    runAction(actionName, params) {
        if (Object.keys(this.#actions).includes(actionName)) {
            return this.#actions[actionName].run(this, params);
        } else if (
            typeof this["run" + notCommon.capitalizeFirstLetter(actionName)] ===
            "function"
        ) {
            return this["run" + notCommon.capitalizeFirstLetter(actionName)](
                params
            );
        } else {
            throw new Error(
                `No such action: ${actionName} in contoller ${this.getWorking(
                    "name"
                )}`
            );
        }
    }

    /**
     *  Changes location to create page, after delay
     *  @param {number|string} [delay=0] number for ms, or string if we use `delays` alises aka SHORT, NORMAL, LONG
     */
    goCreate(delay = 0) {
        this.goAfterDelay(this.getModelActionURL("", "create"), delay);
    }

    /**
     *  Changes location to document details page, after delay
     *  @param {string}         id          target document id
     *  @param {number|string}  [delay=0]   number for ms, or string if we use `delays` alises aka SHORT, NORMAL, LONG
     */
    goDetails(id, delay = 0) {
        this.goAfterDelay(this.getModelActionURL(id, ""), delay);
    }

    /**
     * Changes location to document update page, after delay
     * @param {string}          id          target document id
     *  @param {number|string}  [delay=0]   number for ms, or string if we use `delays` alises aka SHORT, NORMAL, LONG
     */
    goUpdate(id, delay = 0) {
        this.goAfterDelay(this.getModelActionURL(id, "update"), delay);
    }

    /**
     *  Changes location to document delete page, after delay
     *  @param {string}         id          target document id
     *  @param {number|string}  [delay=0]   number for ms, or string if we use `delays` alises aka SHORT, NORMAL, LONG
     */
    goDelete(id, delay = 0) {
        this.goAfterDelay(this.getModelActionURL(id, "delete"), delay);
    }

    /**
     *  Changes location to documents list page, after delay
     *  @param {number|string}  [delay=0]   number for ms, or string if we use `delays` alises aka SHORT, NORMAL, LONG
     */
    goList(delay = 0) {
        this.goAfterDelay(this.getModelURL(), delay);
    }

    /**
     *
     * @param {string} url
     * @param {number|string} delay
     */
    goAfterDelay(url, delay = 0) {
        this.navigateWithDelay(url, delay, () => this.$destroyUI());
    }

    /**
     *  Changes location to documents list page, after delay
     *  @param {number|string}  [delay=0]   number for ms, or string if we use `delays` alises aka SHORT, NORMAL, LONG
     */
    goBack(delay = 0) {
        this.goList(delay);
    }

    async onActionSubmit(action, item) {
        let state = true;
        const actionUI = this.ui[action];
        if (actionUI) {
            try {
                actionUI.setLoading();
                let result = await this.getModel(item)[`$${action}`]();
                state = actionUI.processResult(result);
            } catch (e) {
                state = actionUI.processResult(e);
            } finally {
                actionUI.resetLoading();
                return state;
            }
        }
        throw new Error("Action UI doesnt exist");
    }

    $destroyUI() {
        for (let name in this.ui) {
            this.ui[name].$destroy && this.ui[name].$destroy();
            this.ui[name].destroy && this.ui[name].destroy();
            delete this.ui[name];
        }
    }

    showErrorMessage(res) {
        this.error && this.error(res);
        this.app &&
            this.app.emit("error", {
                title: "Произошла ошибка",
                message: res.message ? res.message : UICommon.ERROR_DEFAULT,
            });
        CRUDMessage.error(
            this,
            "Произошла ошибка",
            res.message ? res.message : UICommon.ERROR_DEFAULT
        );
    }

    showSuccessMessage(title, message) {
        this.app && this.app.emit("success", { title, message });
        CRUDMessage.success(this, title, message);
    }

    setUI(name, val) {
        this.$destroyUI();
        this.ui[name] = val;
    }

    getActionUI() {
        return this.ui[this.getCurrentAction()];
    }

    renderLoadingScreen() {
        this.setUI("loading_screen", this.createLoaderUI());
    }

    createLoaderUI() {
        return new UILoader({
            target: this.getContainerInnerElement(),
            props: {
                loading: true,
                title: "",
            },
        });
    }
}

export default notCRUD;
