import notCommon from "../../../common";
import CRUDGenericAction from "./action";

const DEFAUL_BREADCRUMB_TAIL = "Редактирование";
/**
 * Generic CRUD Update action class
 * @class
 */
class CRUDGenericActionUpdate extends CRUDGenericAction {
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
            set: `${DEFAUL_BREADCRUMB_TAIL}: "{:title}"`,
        };
    }

    /**
     * @static {string} ACTION this controller action name, used in URI
     */
    static get ACTION() {
        return "update";
    }

    /**
     * @static {string} MODEL_ACTION_GET    network model interface action name, used in API
     */
    static get MODEL_ACTION_GET() {
        return "getRaw";
    }

    /**
     * @static {string} MODEL_ACTION_PUT    network model interface action name, used in API
     */
    static get MODEL_ACTION_PUT() {
        return "update";
    }

    /**
     * Creates object with all options needed to initialize UI component
     * @param {object} controller   instance of controller
     * @param {object} response     API reponse object
     * @returns {object}    ui options object
     */
    static prepareUIOptions(controller, response) {
        const actionName = this.getModelActionName(controller);
        return {
            options: {
                target: controller.getContainerInnerElement(),
                model: controller.getModelName(),
                action: this.MODEL_ACTION_PUT, //will be used to get form fields information from manifest
                name: `${controller.getName()}.${this.ACTION}Form`,
                validators: controller.getOptions("Validators"),
                variants: controller.getOptions(`variants.${this.ACTION}`, {}),
                ui: controller.getOptions(`${this.ACTION}.ui`, {}),
                fields: controller.getOptions(`${this.ACTION}.fields`, {}),
                masters: controller.getOptions(`${this.ACTION}.masters`, {}),
            },
            data: this.TRANSFORMER(notCommon.stripProxy(response.result)),
        };
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
        if (notCommon.isFunc(controller.onActionSubmit)) {
            this.bindUIEvent(controller, "submit", async (ev) => {
                const success = await controller.onActionSubmit(this.ACTION, {
                    ...this.loadDataQuery(controller, params),
                    ...ev.detail,
                });
                if (success) {
                    if (notCommon.isFunc(controller.goBack)) {
                        setTimeout(() => controller.goBack(), 1000);
                    }
                }
            });
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

export default CRUDGenericActionUpdate;
