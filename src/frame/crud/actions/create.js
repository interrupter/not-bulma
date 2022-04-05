import {notForm} from '../../components';

const ACTION = 'create';
const MODEL_ACTION = 'create';

export default class CRUDActionCreate {
  static async run(controller, params = []) {
    try{
      await controller.preloadVariants(ACTION);
      controller.setBreadcrumbs([{
        title: 'Добавление',
        url: controller.getModelActionURL(false, ACTION)
      }]);
      if (controller.ui[ACTION]) {
        return;
      } else {
        controller.$destroyUI();
      }
      const createActionName = controller.getOptions(`${ACTION}.actionName`, MODEL_ACTION);
      let defData = controller.createDefault();
      if(defData.getData){
        defData = defData.getData();
      }
      controller.ui[ACTION] = new notForm({
        options:{
          target: controller.els.main,
          model: controller.getModelName(),
          action: createActionName,
          name: `${controller.getName()}.${ACTION}Form`,
          validators: controller.getOptions('Validators'),
          variants: controller.getOptions(`variants.${ACTION}`, {}),
        },
        data: defData
      });
      controller.ui[ACTION].$on('submit', async (data) => {
        const success = await controller.onActionSubmit(createActionName, data);
        if(success){
          controller.ui[ACTION].setFormSuccess();
          setTimeout(() => controller.goList(), 1000);
        }
      });
      controller.ui[ACTION].$on('reject', controller.goList.bind(controller));
      controller.emit(`after:render:${ACTION}`);
    }catch(e){
      controller.report(e);
      controller.showErrorMessage(e);
    }
  }
}
