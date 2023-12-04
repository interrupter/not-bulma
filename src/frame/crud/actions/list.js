import { notTable } from "../../components";

const ACTION = "list";

export default class CRUDActionList {
    static async run(controller, params) {
        try {
            await controller.preloadVariants(ACTION);

            controller.setBreadcrumbs([
                {
                    title: "Список",
                    url: controller.getModelURL(),
                },
            ]);

            if (controller.ui[ACTION]) {
                return;
            } else {
                controller.$destroyUI();
            }

            controller.ui[ACTION] = new notTable(
                CRUDActionList.prepareOptions(controller)
            );

            controller.emit(
                `after:render:${ACTION}`,
                params,
                controller.ui[ACTION]
            );
        } catch (e) {
            //informing about exception
            controller.emit(`exception:render:${ACTION}`, params, e);
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }

    static prepareOptions(controller) {
        const DEFAULT_OPTIONS_TABLE = {
            interface: controller.getOptions(`${ACTION}.interface`, {
                combined: true,
                factory: controller.getInterface(),
            }),
            fields: undefined,
            showSelect: undefined,
            getItemId: undefined,
            idField: undefined,
            preload: {},
            filterUI: controller.getOptions(`${ACTION}.filterUI`),
            pager: { size: 50, page: 0 },
            sorter: {
                id: -1,
            },
            filter: undefined,
            ui: undefined,
        };
        const TABLE_OPTIONS = {
            options: {
                targetEl: controller.getContainerInnerElement(),
                endless: false,
                actions: [
                    {
                        title: "Создать",
                        action: controller.goCreate.bind(controller),
                    },
                    ...controller.getOptions(`${ACTION}.actions`, []),
                ],
            },
        };
        Object.keys(DEFAULT_OPTIONS_TABLE).forEach((key) => {
            let optVal = controller.getOptions(
                `${ACTION}.${key}`,
                DEFAULT_OPTIONS_TABLE[key]
            );
            if (typeof optVal !== "undefined") {
                TABLE_OPTIONS.options[key] = optVal;
            }
        });
        return TABLE_OPTIONS;
    }
}
