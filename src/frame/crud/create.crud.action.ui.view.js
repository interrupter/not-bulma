import UIAdapterSvelte from "../ui.adapter.svelte";
import notCommon from "../common";
import { DEFAULT_TRASFORMER } from "./const";

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
                if (controller.getUI(ACTION)) {
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
                const props = { 
                    params, ...resultTransformer(data), 
                };
                const UI = new UIAdapterSvelte(
                    UIConstructor,
                    controller.getContainerInnerElement(),
                    props,
                );
                if (goBack && notCommon.isFunc(goBack)) {
                    UI.on('onreject', goBack);
                }
                controller.setUI(ACTION, UI);                
                controller.emit(`after:render:${ACTION}`);               
            } catch (e) {
                controller.report(e);
                controller.showErrorMessage(e);
            }
        }
    };
};
