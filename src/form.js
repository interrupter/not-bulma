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

  static build({target, manifest, action, options = {}, validators = {}, data = null}){
    if(Object.prototype.hasOwnProperty.call(manifest, 'fields')){
      FIELDS.import(manifest.fields);
    }
    if(typeof options === 'undefined' || options === null){
      options = {};
    }

    if (manifest.actions[action].fields){
      manifest.actions[action].fields.forEach((fieldName)=>{
        if(!Object.prototype.hasOwnProperty.call(options,'fields')){          options.fields = {};            }
        if(!Object.prototype.hasOwnProperty.call(options.fields, fieldName)){ options.fields[fieldName] = {}; }
        //copying validators
        if(validators&& validators.fields && Object.prototype.hasOwnProperty.call(validators.fields, fieldName)){
          options.fields[fieldName].validate = validators.fields[fieldName];
        }
        //copying initial data
        if(typeof data !== 'undefined' && data!== null &&
        typeof data[fieldName] !== 'undefined' && data[fieldName]!== null){
          options.fields[fieldName].value = data[fieldName];
        }
      });
    }

    if(typeof validators !== 'undefined' && validators !== null){
      if(Object.prototype.hasOwnProperty.call(validators, 'forms')){
        if(Object.prototype.hasOwnProperty.call(validators.forms, action)){
          options.validate = validators.forms[action];
        }
      }
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
