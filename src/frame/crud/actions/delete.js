const ACTION = 'delete';
const MODEL_ACTION = 'delete';

export default class CRUDActionDelete{
  static async run(controller, params) {
    try{
      await controller.preloadVariants(ACTION);
      controller.setBreadcrumbs([{
        title: 'Удаление',
        url: controller.getModelActionURL(params[0], ACTION)
      }]);

      if (confirm('Удалить запись?')) {
        const deleteActionName = controller.getOptions(`${ACTION}.actionName`, MODEL_ACTION);
        const success = await controller.onActionSubmit(deleteActionName, {
          _id: params[0]
        });
        if(success){
          controller.goList();
        }
      } else {
        controller.goList();
      }
    }catch(e){
      controller.report(e);
      controller.showErrorMessage(e);
    }
  }

}
