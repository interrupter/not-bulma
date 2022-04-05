import {UISuccess, UIError} from '../../elements/notification';

export default class CRUDMessage{

  static error(controller, title, message){
    controller.setUI('__message__', new UIError({
      target: controller.getContainerInnerElement(),
      props:{title, message}
    }));
  }

  static success(controller, title, message){
    controller.setUI('__message__', new UISuccess({
      target: controller.getContainerInnerElement(),
      props:{title, message}
    }));
  }
}
