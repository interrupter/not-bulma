import { notLocale } from "../../../../locale";
import notCommon from "../../../common";
import { notForm } from "../../../components";
import { DEFAULT_TRASFORMER } from "../../const";

const DEFAUL_BREADCRUMB_TAIL = "Просмотр";
/**
 * Generic CRUD action class
 * @class
 */
class CRUDGenericAction {
    /**
     * Default breadcrumbs tail template string
     * @returns {string}
     */
    static get deafultBreadcrumbsTail() {
        return DEFAUL_BREADCRUMB_TAIL;
    }

    /**
     * Libarary of breadcrumbs tails strings templates
     * @returns {Object}
     */
    static get breadcrumbsTails() {
        return {
            preset: DEFAUL_BREADCRUMB_TAIL,
            set: 'Просмотр, "{:title}"',
        };
    }

    /**
     * Returns template of breadcrumbs tail
     * @param   {string}    name
     * @returns {string}    template string
     */
    static getBreadcrumbsTail(name) {
        return notCommon.select(
            this.breadcrumbsTails,
            name,
            this.deafultBreadcrumbsTail
        );
    }
    /**
     * @static {string} ACTION this controller action name, used in URI
     */
    static get ACTION() {
        return "details";
    }
    /**
     * @static {string} MODEL_ACTION    network model interface action name, used in API
     */
    static get MODEL_ACTION_GET() {
        return "get";
    }

    /**
     * @static {string} MODEL_ACTION    network model interface action name, used in API
     */
    static get MODEL_ACTION_PUT() {
        return "get";
    }

    /**
     * @static {object} UIConstructor    constructor of UI component
     */
    static get UIConstructor() {
        return notForm;
    }
    /**
     * @static {function}   TRANSFORMER     response.result transformation function if want to change it's structure
     */
    static get TRANSFORMER() {
        return DEFAULT_TRASFORMER;
    }
    /**
     * Returns name of model identificaiton field
     * @param {object} controller instance of controller
     * @returns {string}    default id field name is '_id'
     */
    static getIdField(controller) {
        return controller.getOptions(`${this.ACTION}.idField`, "_id");
    }

    static loadDataQuery(controller, params) {
        const idField = this.getIdField(controller);
        return { [idField]: params[0] };
    }

    /**
     * Return Promise of API reponse
     * @param {object} controller instance of controller
     * @param {string[]} params     array of strings parsed from URI by router and passed to controller
     * @returns {Promise}   API response {status:string, result:any, message:string, errors: {[fieldname]:[...errorMessages]}}
     */
    static async loadData(controller, params) {
        const query = this.loadDataQuery(controller, params);
        const actionName = this.getModelActionName(controller);
        return await controller.getModel(query)[`$${actionName}`]();
    }

    /**
     * Returns model API action name
     * @param {object} controller instance of controller
     * @returns {string}    network interface model action name, for API; default: this.MODEL_ACTION_GET
     */
    static getModelActionName(controller) {
        return controller.getOptions(
            `${this.ACTION}.actionName`,
            this.MODEL_ACTION_GET
        );
    }

    /**
     * Sets breadcrumbs tail, without result details
     * @param {object} controller instance of controller
     * @param {string[]} params     list of route params
     */
    static presetBreadcrumbs(controller, params) {
        controller.setBreadcrumbs([
            {
                title: this.getBreadcrumbsTail("preset"),
                url: controller.getModelActionURL(params[0], false),
            },
        ]);
    }

    static getTitle(contoller, params, response) {
        return contoller.getItemTitle(response.result);
    }

    /**
     * Sets breadcrumbs tail with response details, aka title of loaded item
     * @param {object} controller   instance of controller
     * @param {string[]} params     list of route params
     * @param {object} response     API response in wrapper
     * @param {object} response.result  API response result
     */
    static setBreadcrumbs(controller, params, response) {
        const title = this.getTitle(controller, params, response);
        const breadcrumbsTailTemplate = this.getBreadcrumbsTail("set");
        controller.setBreadcrumbs([
            {
                title: notLocale.format(breadcrumbsTailTemplate, { title }),
                url: controller.getModelActionURL(params[0], false),
            },
        ]);
    }

    /**
     * Checks response on success
     * @param {object} response
     * @param {string} response.status
     * @returns {boolean}   true if response is bad
     */
    static isResponseBad(response) {
        return !response || response.status !== "ok";
    }

    /**
     * Creates object with all options needed to initialize UI component
     * @param {object} controller   instance of controller
     * @param {object} response     API reponse object
     * @returns {object}    ui options object
     */
    static prepareUIOptions(controller, response) {
        const detailsActionName = this.getModelActionName(controller);
        return {
            options: {
                target: controller.getContainerInnerElement(),
                model: controller.getModelName(),
                action: detailsActionName,
                name: `${controller.getName()}.${this.ACTION}Form`,
                fields: {
                    readonly: true,
                },
                validators: controller.getOptions("Validators"),
                variants: controller.getOptions(`variants.${this.ACTION}`, {}),
                masters: controller.getOptions(`${this.ACTION}.masters`, {}),
            },
            data: this.TRANSFORMER(response.result),
        };
    }

    /**
     * Returns instance of this action UI component from controller
     * @param {object} controller   instance of controller
     * @returns {object}    instance of UI component
     */
    static getUI(controller) {
        return controller.ui[this.ACTION];
    }

    /**
     * Sets UI of this action in controller
     * @param {object} controller   instance of controller
     * @param {object} ui           instance of UI component
     */
    static setUI(controller, ui) {
        controller.ui[this.ACTION] = ui;
    }

    /**
     * Binds events to action UI
     * @param {object} controller   instance of controller
     * @param {string[]} params     list of route params
     * @param {object} response     API response
     */
    static bindUIEvents(controller, params, response) {
        if (notCommon.isFunc(controller.goBack)) {
            this.bindUIEvent(
                controller,
                "reject",
                controller.goBack.bind(controller)
            );
        }
    }

    /**
     * Bind event handler named event to UI. Checks different binder notation $on/on
     * @param {object} controller   instance of controller
     * @param {string} event        event name
     * @param {function} callback   callback function on event
     * @returns
     */
    static bindUIEvent(controller, event, callback) {
        const ui = this.getUI(controller);
        if (ui.$on) {
            return ui.$on(event, callback);
        }
        if (ui.on) {
            return ui.on(event, callback);
        }
    }

    /**
     * true, if UI of this action already exists,
     * false, if UI of this action wasn't existed and other UIs were destoryed
     * @param {object} controller   instance of controller
     * @returns {boolean}   true if UI of this action exists, false if UI of other was destroyed
     */
    static isUIRendered(controller) {
        if (this.getUI(controller)) {
            return true;
        } else {
            controller.$destroyUI();
        }
        return false;
    }

    /**
     * Performing action preparation and renders UI
     * @param {object} controller   instance of controller
     * @param {string[]} params     list of route params
     * @returns {undefined}
     */
    static async run(controller, params) {
        try {
            //inform that we are starting
            controller.emit(`before:render:${this.ACTION}`, [params]);
            //if UI for this action exists exiting
            if (this.isUIRendered(controller)) {
                return;
            }
            //preloading form variants
            await controller.preloadVariants(this.ACTION);
            //setting initial state of breadcrumbs tail
            this.presetBreadcrumbs(controller, params);
            //loading data
            const response = await this.loadData(controller, params);
            //showing error message if response is 'bad'
            if (this.isResponseBad(response)) {
                return controller.showErrorMessage(response);
            }
            //updating breadcrumbs tail with more details from response
            this.setBreadcrumbs(controller, params, response);
            //creating action UI component
            const uiComponent = this.UIConstructor;
            this.setUI(
                controller,
                new uiComponent(this.prepareUIOptions(controller, response))
            );
            //bind events to UI
            this.bindUIEvents(controller, params, response);
            //inform that we are ready
            controller.emit(`after:render:${this.ACTION}`);
        } catch (e) {
            //informing about exception
            controller.emit(`exception:render:${this.ACTION}`, [params, e]);
            //reporting exception
            controller.report(e);
            //showing error message
            controller.showErrorMessage(e);
        }
    }
}

export default CRUDGenericAction;
