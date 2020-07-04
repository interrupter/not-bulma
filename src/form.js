import validator from 'validator';
import UIForm from './form/form.svelte';
import { FIELDS, COMPONENTS } from './form/LIB.js';

class Form{
  static validator = validator;
  static addComponent(name, comp){
    COMPONENTS.add(name, comp);
  }

  static addField(name, field){
    FIELDS.add(name, field);
  }

  static build(target, manifest, action, options){
    if(Object.prototype.hasOwnProperty.call(manifest, 'fields')){
      FIELDS.import(manifest.fields);
    }
    return new UIForm({
      target,
      props: {
        title:        manifest.actions[action].title,
        description:  manifest.actions[action].description,
        fields:       manifest.actions[action].fields,
        options
      }
    });
  }

}

export default Form;
