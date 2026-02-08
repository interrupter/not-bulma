import CRUDGenericAction from "./action";
import notCommon from "../../../common";
const ACTION = "create";
const DEFAULT_BREADCRUMB_TAIL = "Создание";

class CRUDGenericActionCreate extends CRUDGenericAction {
    static get deafultBreadcrumbsTail() {
        return DEFAULT_BREADCRUMB_TAIL;
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

    /**
     *
     * @param {import('../../controller.crud')} controller
     * @param {any}                         params
     * @returns {import('not-node/src/types').notAppResponse}
     */
    static loadData(controller, params) {
        let defData = controller.createDefault();
        if (defData.getData) {
            defData = defData.getData();
        }
        return {
            status: "ok",
            result: defData,
        };
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
                validators: this.getValidators(controller),
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
            this.bindUIEvent(controller, "onreject", () =>
                this.goBack(controller)
            );
        }
        if (notCommon.isFunc(controller.onActionSubmit)) {
            this.bindUIEvent(controller, "onsubmit", async (ev) => {
                const success = await controller.onActionSubmit(this.ACTION, {
                    ...this.loadDataQuery(controller, params),
                    ...ev,
                });
                if (success) {
                    this.goBackAfterDelay(controller);
                }
            });
        }
    }
}

export default CRUDGenericActionCreate;
