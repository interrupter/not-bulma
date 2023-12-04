import notCommon from "../common";
import { DEFAULT_TRASFORMER } from "./const";
import notForm from "../components/form/form";

export default ({
    MODEL_NAME,
    MODEL_ACTION_UPDATE,
    ACTION,
    TITLE,
    dataProvider,
    goBack,
}) => {
    return class {
        static async run(controller, params) {
            try {
                controller.setBreadcrumbs([
                    {
                        title: `Редактирование "${TITLE}"`,
                    },
                ]);

                await controller.preloadVariants(ACTION);
                controller.setBreadcrumbs([
                    {
                        title: "Редактирование",
                        url: controller.getModelActionURL(params[0], ACTION),
                    },
                ]);
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
                const title = controller.getItemTitle(data);
                controller.setBreadcrumbs([
                    {
                        title: `Редактирование "${title}"`,
                        url: controller.getModelActionURL(params[0], ACTION),
                    },
                ]);

                const resultTransformer = controller.getOptions(
                    `${ACTION}.transformer`,
                    DEFAULT_TRASFORMER
                );

                const transformedData = resultTransformer(data);

                controller.ui[ACTION] = new notForm({
                    options: {
                        target: controller.getContainerInnerElement(),
                        model: MODEL_NAME,
                        action: MODEL_ACTION_UPDATE,
                        name: `${controller.getName()}.${ACTION}Form`,
                        validators: controller.getOptions("Validators"),
                        variants: controller.getOptions(
                            `variants.${ACTION}`,
                            {}
                        ),
                        ui: controller.getOptions(`${ACTION}.ui`, {}),
                        fields: controller.getOptions(`${ACTION}.fields`, {}),
                    },
                    data: transformedData,
                });
                controller.emit(
                    `after:render:${ACTION}`,
                    params,
                    transformedData
                );
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
