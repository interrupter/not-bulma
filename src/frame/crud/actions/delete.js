import notActionUI from "../../components/action/action.ui.js";

const ACTION = "delete";
const MODEL_ACTION = "delete";

export default class CRUDActionDelete {
    static async run(controller, params) {
        try {
            if (controller.ui[ACTION]) {
                return;
            } else {
                controller.$destroyUI();
            }

            controller.ui[ACTION] = new notActionUI({
                name: "CRUDDelete",
                target: controller.getContainerInnerElement(),
                options: {
                    loaderActive: true,
                    loaderStyle: "container",
                    loaderTitle: "not-node:crud_delete_action_waiting",
                    container: {
                        id: `crud-delete-action-${params[0]}`,
                    },
                },
            });

            controller.setBreadcrumbs([
                {
                    title: "Удаление",
                    url: controller.getModelActionURL(params[0], ACTION),
                },
            ]);

            if (confirm("Удалить запись?")) {
                const deleteActionName = controller.getOptions(
                    `${ACTION}.actionName`,
                    MODEL_ACTION
                );
                const success = await controller.onActionSubmit(
                    deleteActionName,
                    {
                        _id: params[0],
                    }
                );
                if (success) {
                    controller.goList();
                }
                return;
            }
            controller.goList();
        } catch (e) {
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }
}
