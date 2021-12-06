import notCommon from './frame/common.js';
import validator from 'validator';
import UICommon from './common.js';
import UIForm from './form/form.svelte';

import FormValidationRunner from './frame/validation/runner';

import { FIELDS, COMPONENTS,  VARIANTS} from './form/LIB.js';

class Form{
  static validator = validator;

  static addComponent(name, value){
    COMPONENTS.add(name, value);
  }

  static addVariants(name, value){
    VARIANTS.add(name, value);
  }

  static addField(name, field){
    FIELDS.add(name, field);
  }

  static actionFieldsInit(fieldName, options, data){
    if(Array.isArray(fieldName)){
      fieldName.forEach( subFieldName => {
        this.actionFieldsInit(subFieldName, options, data);
      });
    }else{
      if(!Object.prototype.hasOwnProperty.call(options, 'fields')){
        options.fields = {};
      }
      if(!Object.prototype.hasOwnProperty.call(options.fields, fieldName)){
        options.fields[fieldName] = {};
      }
      //copying initial data
      if(typeof data !== 'undefined' && data!== null
        &&  typeof data[fieldName] !== 'undefined'
        && data[fieldName]!== null
      ){
        options.fields[fieldName].value = data[fieldName];
      }
    }
  }

  static build({target, manifest, action, options = {}, validators = {}, data = null}){
    const formUI = new UIForm({
      target,
      props: Form.prebuild({manifest, action, options, data})
    });
    const formValidator = new FormValidationRunner(validators);
    formUI.$on('change', async ()=>{
      try{
        const session = await formValidator.all(formUI.collectData(), action);
        formUI.updateFormValidationStatus(session.getCompleteResult());
      }catch(e){
        formUI.updateFormValidationStatus({form:[UICommon.ERROR_DEFAULT]});
        notCommon.report(e);
      }
    });
    return {
      ui: formUI,
      validator: formValidator
    };
  }

  static prebuild({manifest, action, options = {}, data = null}){
    if(Object.prototype.hasOwnProperty.call(manifest, 'fields')){
      FIELDS.import(manifest.fields);
    }
    if(typeof options === 'undefined' || options === null){
      options = {};
    }

    if (manifest.actions[action] && manifest.actions[action].fields){
      this.actionFieldsInit(manifest.actions[action].fields, options, data);
    }

    return {
      title:        manifest.actions[action].title,
      description:  manifest.actions[action].description,
      fields:       manifest.actions[action].fields,
      options
    };
  }

  static getVariantTitle(name, id){
    let lib = VARIANTS.get(name);
    let result = lib.filter(item => item.id === id );
    return result.length === 1 ? result[0]: 'noname';
  }

}

export default Form;
