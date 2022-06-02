import {notForm} from '../../components';
import notCommon from '../../common';

const ACTION = 'update';
const MODEL_ACTION_GET = 'getRaw';
const MODEL_ACTION_UPDATE = 'update';

export default class CRUDActionUpdate{
  static async run(controller, params) {
    try{
      const idField = controller.getOptions(`${ACTION}.idField`, '_id'),
        id = params[0],
        query = {[idField]:id};

      await controller.preloadVariants(ACTION);

      controller.setBreadcrumbs([{
        title: 'Редактирование',
        url: controller.getModelActionURL(id, ACTION)
      }]);

      if (controller.ui[ACTION]) {
        return;
      } else {
        controller.$destroyUI();
      }

      const getActionName = controller.getOptions(`${ACTION}.actionName`, MODEL_ACTION_GET);
      let res = await controller.getModel(query)[`$${getActionName}`]();
      if(!res || (res.status !== 'ok')){
        return controller.showErrorMessage(res);
      }

      const title = controller.getItemTitle(res.result);
      controller.setBreadcrumbs([{
        title: `Редактирование "${title}"`,
        url: controller.getModelActionURL(params[0], ACTION)
      }]);

      controller.ui[ACTION] = new notForm({
        options:{
          target: controller.getContainerInnerElement(),
          model: controller.getModelName(),
          action: MODEL_ACTION_UPDATE,
          name: `${controller.getName()}.${ACTION}Form`,
          validators: controller.getOptions('Validators'),
          variants: controller.getOptions(`variants.${ACTION}`, {}),
          ui:     controller.getOptions(`${ACTION}.ui`, {}),
          fields: controller.getOptions(`${ACTION}.fields`, {}),
        },
        data: notCommon.stripProxy(res.result)
      });

      controller.ui[ACTION].on('submit', async (ev) => {
        const success = await controller.onActionSubmit(ACTION, ev.detail);
        if(success){
          setTimeout(() => controller.goDetails(id), 1000);
        }
      });
      controller.ui[ACTION].on('reject', controller.goList.bind(controller));
      controller.emit(`after:render:${ACTION}`);
    }catch(e){
      controller.report(e);
      controller.showErrorMessage(e);
    }
  }

}
