import {notForm} from '../../components';

const ACTION = 'details';
const MODEL_ACTION = 'get';

export default class CRUDActionDetails {
  static async run(controller, params) {
    try{
      await controller.preloadVariants(ACTION);

      const idField = controller.getOptions(`${ACTION}.idField`, '_id'),
        query = {[idField]: params[0]};

      controller.setBreadcrumbs([{
        title: 'Просмотр',
        url: controller.getModelActionURL(params[0], false)
      }]);

      if (controller.ui[ACTION]) {
        return;
      } else {
        controller.$destroyUI();
      }
      const detailsActionName = controller.getOptions(`${ACTION}.actionName`, MODEL_ACTION);
      let res = await controller.getModel(query)[`$${detailsActionName}`]();
      if (res.status !== 'ok') {
        controller.showErrorMessage(res);
      }

      const title = controller.getItemTitle(res.result);
      controller.setBreadcrumbs([{
        title: `Просмотр "${title}"`,
        url: controller.getModelActionURL(params[0], false)
      }]);

      controller.ui[ACTION] = new notForm({
        options: {
          target: controller.els.main,
          model: controller.getModelName(),
          action: detailsActionName,
          name: `${controller.getName()}.${ACTION}Form`,
          fields:{
            readonly: true,
          },
          validators: controller.getOptions('Validators'),
          variants: controller.getOptions(`variants.${ACTION}`, {}),
        },
        data: res.result
      });
      controller.emit(`after:render:${ACTION}`);
      controller.ui[ACTION].$on('reject', controller.goList.bind(this));
    }catch(e){
      contoller.report(e);
      controller.showErrorMessage(e);
    }
  }
}
