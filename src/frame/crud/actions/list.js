import { notTable } from "../../components";

const ACTION = "list";

export default class CRUDActionList {
    static tweakUIOptions(options) {
        return options;
    }

    static createActionsButtons(
        controller,
        value,
        delay = 0,
        actions = ["details", "update", "delete"],
        prepend = [],
        append = []
    ) {
        const ACTIONS = {
            details: {
                action: () => controller.goDetails(value, delay),
                title: "Подробнее",
                size: "small",
            },
            update: {
                action: () => controller.goUpdate(value, delay),
                title: "Изменить",
                size: "small",
            },
            delete: {
                action: () => controller.goDelete(value, delay),
                color: "danger",
                title: "Удалить",
                size: "small",
                style: "outlined",
            },
        };
        const actionsButtons = [...prepend];
        if (Array.isArray(actions)) {
            actions.forEach((actionName) =>
                actionsButtons.push(ACTIONS[actionName])
            );
        }
        actionsButtons.push(...append);
        return actionsButtons;
    }

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
                this.tweakUIOptions(CRUDActionList.prepareOptions(controller))
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
                        action: () => controller.goCreate(),
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
