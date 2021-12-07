import FormValidationSession from './session.js';

export default class FormValidationRunner{

  constructor(validators){
    this.validators = validators;
  }

  all(data, formName){
    const validators = {
      fields: this.getFieldsValidators(data),
      form: this.getFormValidators(formName),
    };
    return (new FormValidationSession(validators, data));
  }

  getFieldsValidators(data){
    if (this.validators && this.validators.fields){
      const list = Object.keys(data);
      const result = {};
      list.forEach((fieldName)=>{
        if(Array.isArray(this.validators.fields[fieldName])){
          result[fieldName] = this.validators.fields[fieldName];
        }
      });
      return result;
    }else{
      return {};
    }
  }

  getFormValidators(name){
    return this.validators && this.validators.forms && this.validators.forms[name]?this.validators.forms[name]:[];
  }

}
