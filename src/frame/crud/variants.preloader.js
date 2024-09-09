import notCommon from "../common";

const PRELOADABLE = ["create", "update", "list", "delete", "details"];

export default class CRUDVariantsPreloader {
    static async preload(controller, type = "list") {
        try {
            if (!PRELOADABLE.includes(type)) {
                return;
            }
            let preload = controller.getOptions(`${type}.preload`, {});
            if (Object.keys(preload).length == 0) {
                preload = controller.getOptions(`preload`, {});
            }
            if (Object.keys(preload).length > 0) {
                let libProps = Object.keys(preload);
                let proms = [];
                libProps.forEach((prop) => {
                    let modelName = notCommon.lowerFirstLetter(preload[prop]);
                    let Model = controller.make[modelName]({});
                    proms.push(Model.$listAll());
                });
                let results = await Promise.all(proms);
                for (let i = 0; i < libProps.length; i++) {
                    const propName = libProps[i];
                    if (
                        results[i].status === "ok" &&
                        Array.isArray(results[i].result)
                    ) {
                        const resultsList = results[i].result;
                        const variants = resultsList.map((item) => {
                            return {
                                id: item._id,
                                title: item.title,
                            };
                        });
                        controller.setOptions(
                            `variants.${type}.${propName}`,
                            variants
                        );
                    }
                }
            }
            controller.log("preload finished");
        } catch (e) {
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }
}
