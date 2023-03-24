export default class PlainRouter {
    static extractActionName(params) {
        if (params.length > 0) {
            return params[0];
        }
        throw new Error("no action name");
    }

    static route(controller, params) {
        try {
            const actionName = PlainRouter.extractActionName(params);
            controller.setCurrentAction(actionName);
            return controller.runAction(actionName, params);
        } catch (e) {
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }
}
