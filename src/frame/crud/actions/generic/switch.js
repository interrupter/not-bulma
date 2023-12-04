import notCRUDRouterSwitch from "../../router.switch";

/**
 * Action that contains set of few other actions and selects
 * one of them on some condition
 */
class CRUDActionSwitch extends notCRUDRouterSwitch {
    /**
     * @type   {String}
     * @memberof CRUDActionSwitch
     */
    static ACTION = "switch";

    static async run(controller, params) {
        try {
            //inform that we are starting
            controller.emit(`before:render:${this.ACTION}`, params);
            await this.route(controller, params);
            //inform that we are ready
            controller.emit(`after:render:${this.ACTION}`, params);
        } catch (e) {
            //informing about exception
            controller.emit(`exception:render:${this.ACTION}`, params, e);
            //reporting exception
            controller.report(e);
            //showing error message
            controller.showErrorMessage(e);
        }
    }
}

export default CRUDActionSwitch;
