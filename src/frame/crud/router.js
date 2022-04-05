const DEFAULT_ACTION = 'list';

export default class CRUDRouter{
  static extractActionName(params){
    let actionName = DEFAULT_ACTION;
    if (params.length == 1) {
      if (params[0] === 'create') {
        actionName = 'create';
      } else {
        actionName = 'details';
      }
    } else if (params.length > 1) {
      if (params[1] === 'delete') {
        actionName = 'delete';
      } else if (params[1] === 'update') {
        actionName = 'update'
      } else {
        actionName = params[1];
      }
    }
    return actionName;
  }

  static route(controller, params){
    try{
      const actionName = CRUDRouter.extractActionName(params);
      controller.setCurrentAction(actionName);
      return controller.runAction(actionName, params);
    }catch(e){
      notCommon.report(e);
      controller.showErrorMessage(e);
    }
  }
}
