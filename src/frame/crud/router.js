const DEFAULT_ACTION = "list";

class notCRUDRouter {
    static extractActionName(controller, params) {
        let actionName = DEFAULT_ACTION;
        if (params.length === 1) {
            if (params[0] === "create") {
                actionName = "create";
            } else if (controller.actionHandlerExists(params[0])) {
                actionName = params[0];
            } else {
                actionName = "details";
            }
        } else if (params.length > 1) {
            if (params[1] === "delete") {
                actionName = "delete";
            } else if (params[1] === "update") {
                actionName = "update";
            } else {
                actionName = params[1];
            }
        }
        return actionName;
    }

    static route(controller, params) {
        try {
            const actionName = notCRUDRouter.extractActionName(
                controller,
                params
            );
            controller.setCurrentAction(actionName);
            return controller.runAction(actionName, params);
        } catch (e) {
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }
}

export default notCRUDRouter;
