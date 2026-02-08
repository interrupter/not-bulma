import {mount} from 'svelte';
import { UISuccess, UIError } from "../../elements/notification";

export default class CRUDMessage {
    static error(controller, title, message) {
        controller.setUI(
            "__message__",
            mount(UIError,{
                target: controller.getContainerInnerElement(),
                props: { title, message },
            })
        );
    }

    static success(controller, title, message) {
        controller.setUI(
            "__message__",
            mount(UISuccess, {
                target: controller.getContainerInnerElement(),
                props: { title, message },
            })
        );
    }
}
