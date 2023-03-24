import notCommon from "../common";
import { DEFAULT_TRASFORMER } from "../const";
export default ({ ACTION, TITLE, UIConstructor, dataProvider, goBack }) => {
    return class {
        static async run(controller, params) {
            try {
                controller.setBreadcrumbs([
                    {
                        title: `Просмотр "${TITLE}"`,
                    },
                ]);
                await controller.preloadVariants(ACTION);
                if (controller.ui[ACTION]) {
                    return;
                } else {
                    controller.$destroyUI();
                }
                let data = {};
                if (dataProvider) {
                    if (notCommon.isFunc(dataProvider)) {
                        if (notCommon.isAsync(dataProvider)) {
                            data = await dataProvider(params);
                        } else {
                            data = dataProvider(params);
                        }
                    } else {
                        data = { ...dataProvider };
                    }
                }
                const resultTransformer = controller.getOptions(
                    `${ACTION}.transformer`,
                    DEFAULT_TRASFORMER
                );
                controller.ui[ACTION] = new UIConstructor({
                    target: controller.getContainerInnerElement(),
                    props: { params, ...resultTransformer(data) },
                });
                controller.emit(`after:render:${ACTION}`);
                if (goBack && notCommon.isFunc(goBack)) {
                    controller.ui[ACTION].on("reject", () => goBack());
                }
            } catch (e) {
                controller.report(e);
                controller.showErrorMessage(e);
            }
        }
    };
};
