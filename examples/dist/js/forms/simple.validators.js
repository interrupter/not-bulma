//examples/src/js/forms/simple.validators.js

const wait = tm => new Promise(res => setTimeout(res, tm));

export default {
  fields: {
    nameFirst: [{
      //sync or async variants possible
      validator: (fieldValue, validationEnvironment = {}) => {
        return fieldValue.length > 2;
      },
      //error message. plain text or LOCALE string name
      message: 'nameFirst should be atleast 2 letters long'
    }],
    nameLast: [{
      validator: (fieldValue, validationEnvironment = {}) => {
        return fieldValue.length > 1;
      },
      message: 'nameLast should be atleast 2 letters long'
    }],
    email: [{
      validator: (fieldValue, validationEnvironment = {}) => {
        return fieldValue.indexOf('@mail.ru') > -1;
      },
      message: 'email should be in @mail.ru'
    }],
    telephone: [{
      validator: (fieldValue, validationEnvironment = {}) => {
        return fieldValue.length > 10;
      },
      message: 'wrong telephone'
    }],
    country: [{
      validator: (fieldValue, validationEnvironment = {}) => {
        return ["1", "2", "3", "4"].includes(fieldValue.toString());
      },
      message: '__country_code_error__'
    }],
    login: [{
      validator: (fieldValue, validationEnvironment = {}) => {
        return !["root", "admin"].includes(fieldValue.toString());
      },
      message: '__wrong_user__'
    }, {
      validator: (fieldValue, validationEnvironment = {}) => {
        return fieldValue.length > 3;
      },
      message: '4 letters minimum'
    }],
    password: [{
      validator: (fieldValue, validationEnvironment = {}) => {
        return fieldValue.length > 3;
      },
      message: '4 chars minimum'
    }]
  },
  //forms: Object for multiple forms validators
  forms: {
    //form action name
    create: [
    //sync or async variants possible
    async (formData, validationEnvironment = {}) => {
      await wait(1000); //simulate async request to server for example
      if (formData.nameFirst === formData.nameLast && formData.nameLast && formData.nameLast.length > 3) {
        //to add errors to validation session result you need
        //to throw notValidationError compatible error
        throw new notError.notValidationError('form error', {
          form: ['fields are equal'],
          fields: {
            nameFirst: ['Could not be equal to nameLast'],
            nameLast: ['Could not be equal to nameFirst']
          }
        });
      }
    }],
    login: [async (formData, validationEnvironment = {}) => {
      await wait(1000); //simulate async request to server for example
    }],
    delete: [],
    update: []
    //and so on
  }
  //or if you need only one form validation
  //form: Array<function> for single form only
  /* like this
  form:[
    async (formData, validationEnvironment = {})=>{
      await wait(1000); //simulate async request to server for example
      if(formData.nameFirst === formData.nameLast){
        throw new notError.notValidationError('form error', {
          form: ['fields are equal'],
          fields: {
            nameFirst: ['Could not be equal to nameLast'],
            nameLast: ['Could not be equal to nameFirst'],
          }
        });
      }
    },
  ]
  */
};