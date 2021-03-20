import Form from '../form.js';

const Validators = {
  fields: {
    term(value) {
      let errors = [];
      if(value!==''){
        if (!Form.validator.isLength(value, {
            min: 3
          })) {
          errors.push('Минимальная длина 3 знаков');
        }
      }
      return errors;
    }
  },
  forms:{
    search(form) {
      let errors = {
        clean: true,
        fields: {},
        form: []
      };
      return errors;
    }
  }
};

export default Validators;
