const ROUTE_LIST = "list";
/**
 * Runs controller action by name that gets from URI params
 * @class
 */
class notCRUDPlainRouter {
    static DEFAULT_ROUTE = ROUTE_LIST;
    /**
     * Returns first item from params or throws Error
     * @param {string[]} params array of strings parsed from URI by route rules
     * @returns {string}
     */
    static extractActionName(params) {
        if (params.length > 0) {
            return params[0];
        }
        return DEFAULT_ROUTE;
    }

    /**
     * Runs controller action or throws
     * @param {object} controller   instance of notController descendant
     * @param {string[]} params
     */
    static route(controller, params) {
        try {
            const actionName = this.extractActionName(params);
            controller.setCurrentAction(actionName);
            return controller.runAction(actionName, params);
        } catch (e) {
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }
}

export default notCRUDPlainRouter;
