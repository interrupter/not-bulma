import { notTable } from "../../components";

const ACTION = "list";

export default class CRUDActionList {
    static tweakActionsList(controller, ACTIONS_LIST) {
        if (controller.getOptions(`${ACTION}.createAction`, true)) {
            ACTIONS_LIST.push({
                title: "Создать",
                action: () => controller.goCreate(),
            });
        }
        return ACTIONS_LIST;
    }

    static tweakUIOptions(options) {
        return options;
    }

    /**
     *
     *
     * @static
     * @param {import('../controller.crud').default} controller
     * @param {string} value
     * @param {number} [delay=0]
     * @param {Array<string>} [actions=["details", "update", "delete"]]
     * @param {Array<object>} [prepend=[]]
     * @param {Array<object>} [append=[]]
     * @param {boolean} [onlyIcons=true]
     * @return {Array<object>}
     * @memberof CRUDActionList
     */
    static createActionsButtons(
        controller,
        value,
        delay = 0,
        actions = ["details", "update", "delete"],
        prepend = [],
        append = [],
        onlyIcons = true
    ) {
        const ACTIONS = {
            details: {
                action: () => controller.goDetails(value, delay),
                ...(onlyIcons
                    ? { icon: "circle-info" }
                    : { title: "Подробнее" }),
                size: "small",
            },
            update: {
                action: () => controller.goUpdate(value, delay),
                ...(onlyIcons ? { icon: "edit" } : { title: "Изменить" }),
                color: "warning",
                size: "small",
            },
            delete: {
                action: () => controller.goDelete(value, delay),
                color: "danger",
                ...(onlyIcons ? { icon: "trash" } : { title: "Удалить" }),
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
            //indicating that we are working
            controller.renderLoadingScreen && controller.renderLoadingScreen();

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
        } finally {
            controller.removeLoadingScreen && controller.removeLoadingScreen();
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
        //forming actions buttons list
        let ACTIONS_LIST = [...controller.getOptions(`${ACTION}.actions`, [])];
        ACTIONS_LIST = this.tweakActionsList(controller, ACTIONS_LIST);
        //
        const TABLE_OPTIONS = {
            options: {
                targetEl: controller.getContainerInnerElement(),
                endless: false,
                actions: ACTIONS_LIST,
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
