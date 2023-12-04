import notCommon from "../common";

/**
 * Runs controller action by name that gets from URI params
 * @class
 */
class notCRUDRouterSwitch {
    /**
     * Variants of this action
     */
    static get routesVariants() {
        return {
            /**
            routeName: Action
             */
        };
    }

    /**
     * Returns true if variant name is valid
     * @param {string} name    name of route variant
     * @returns {boolean}
     */
    static isRouteVariantValid(name) {
        return name !== "" && notCommon.objHas(this.routesVariants, name);
    }

    /**
     * This function returns which of routes variant should be executed
     * @param {object} controller   instance of notController descendant
     * @param {string[]}    params  params passed to router
     * @returns {Promise<string>}    name of route variant
     */
    static async determineRoute(controller, params = []) {
        return "";
    }

    /**
     * Runs controller action or throws
     * @param {object} controller   instance of notController descendant
     * @param {string[]} params
     */
    static async route(controller, params) {
        try {
            const actionName = await this.determineRoute(controller, params);
            if (this.isRouteVariantValid(actionName)) {
                controller.setCurrentAction(actionName);
                const routerAction = this.routesVariants[actionName];
                if (notCommon.isAsync(routerAction.run)) {
                    await routerAction.run(controller, params);
                } else {
                    routerAction.run(controller, params);
                }
            } else {
                throw new Error(
                    `No such action: ${actionName} in contoller ${controller.getWorking(
                        "name"
                    )}`
                );
            }
        } catch (e) {
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }
}

export default notCRUDRouterSwitch;
