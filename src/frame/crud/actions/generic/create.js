import CRUDGenericAction from "./action";
import notCommon from "../../../common";
const ACTION = "create";
const DEFAUL_BREADCRUMB_TAIL = "Создание";

class CRUDGenericActionCreate extends CRUDGenericAction {
    static get deafultBreadcrumbsTail() {
        return DEFAUL_BREADCRUMB_TAIL;
    }

    static get breadcrumbsTails() {
        return undefined;
    }

    static get ACTION() {
        return ACTION;
    }
    /**
     * @static {string} MODEL_ACTION    network model interface action name, used in API
     */
    static get MODEL_ACTION_GET() {
        return ACTION;
    }

    /**
     * @static {string} MODEL_ACTION    network model interface action name, used in API
     */
    static get MODEL_ACTION_PUT() {
        return ACTION;
    }

    static loadData(controller, params) {
        let defData = controller.createDefault();
        if (defData.getData) {
            defData = defData.getData();
        }
        return defData;
    }

    static isResponseBad(reponse) {
        return !reponse;
    }

    static getTitle(contoller, params, response) {
        return contoller.getItemTitle(response);
    }

    static prepareUIOptions(controller, response) {
        const actionName = this.getModelActionName(controller);
        return {
            options: {
                target: controller.getContainerInnerElement(),
                model: controller.getModelName(),
                action: actionName,
                name: `${controller.getName()}.${this.ACTION}Form`,
                validators: controller.getOptions("Validators"),
                variants: controller.getOptions(`variants.${this.ACTION}`, {}),
                masters: controller.getOptions(`${this.ACTION}.masters`, {}),
            },
            data: this.TRANSFORMER(response),
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
                    this.goBack();
                }
            });
        }
    }
}

export default CRUDGenericActionCreate;
