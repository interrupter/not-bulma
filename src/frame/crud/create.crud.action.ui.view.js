export default (ACTION, TITLE, UIConstructor) => {
    return class {
        static async run(controller, params) {
            try {
                controller.setBreadcrumbs([
                    {
                        title: `Просмотр "${TITLE}"`,
                    },
                ]);
                if (controller.ui[ACTION]) {
                    return;
                } else {
                    controller.$destroyUI();
                }
                controller.ui[ACTION] = new UIConstructor({
                    target: controller.getContainerInnerElement(),
                    props: { params },
                });
                controller.emit(`after:render:${ACTION}`);
            } catch (e) {
                controller.report(e);
                controller.showErrorMessage(e);
            }
        }
    };
};
