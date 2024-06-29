import CRUDGenericAction from "./action";

/**
 * Generic CRUD Details action class
 * @class
 */
class CRUDGenericActionRead extends CRUDGenericAction {
    static tweakUIOptions(options) {
        options.options.ui = {
            submit: {
                enabled: false,
            },
        };
        return options;
    }

    /**
     * Performing action preparation and renders UI
     * @param {object} controller   instance of controller
     * @param {string[]} params     list of route params
     * @returns {Promise<undefined>}
     */
    static async run(controller, params) {
        try {
            //inform that we are starting
            controller.emit(`before:render:${this.ACTION}`, params);
            //if UI for this action exists exiting
            if (this.isUIRendered(controller)) {
                return;
            }
            //preloading form variants
            await controller.preloadVariants(this.ACTION);
            //setting initial state of breadcrumbs tail
            this.presetBreadcrumbs(controller, params);
            //loading data
            const response = await this.loadData(controller, params);
            //showing error message if response is 'bad'
            if (this.isResponseBad(response)) {
                return controller.showErrorMessage(response);
            }
            //updating breadcrumbs tail with more details from response
            this.setBreadcrumbs(controller, params, response);
            //creating action UI component
            const uiComponent = this.UIConstructor;
            this.setUI(
                controller,
                new uiComponent(
                    this.tweakUIOptions(
                        this.prepareUIOptions(controller, response)
                    )
                )
            );
            //bind events to UI
            this.bindUIEvents(controller, params, response);
            //inform that we are ready
            controller.emit(`after:render:${this.ACTION}`, params, response);
        } catch (e) {
            //informing about exception
            controller.emit(`exception:render:${this.ACTION}`, params, e);
            //reporting exception
            controller.report(e);
            //showing error message
            controller.showErrorMessage(e);
        }
    }
}

export default CRUDGenericActionRead;
