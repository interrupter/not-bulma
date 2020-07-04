
function passValidator(value) {
  let errors = [];
  if (!notBulma.Form.validator.isLength(value, {
      min: 6
    })) {
    errors.push('Минимальный размер пароля 6 знаков');
  }
  return errors;
}


const Validators = {
  fields: {
    username(value) {
      let errors = [];
      if (!notBulma.Form.validator.isLength(value, {
          min: 6
        })) {
        errors.push('Минимальная длина 6 знаков');
      }
      return errors;
    },
    password: passValidator,
    password2: passValidator,
    date(value) {
      let errors = [];
      try {
        let curDate = new Date(),
          valueDate = new Date(value);
        if (valueDate >= curDate) {
          errors.push('Дата должна быть в прошлом');
        }
      } catch (e) {
        e && errors.push('Формат даты не верный');
      }
      return errors;
    },
    validTill(value) {
      let errors = [];
      try {
        let curDate = new Date(),
          valueDate = new Date(value);
        if (valueDate <= curDate) {
          errors.push('Дата должна быть в будущем');
        }
      } catch (e) {
        e && errors.push('Формат даты не верный');
      }
      return errors;
    },
    telephone(value) {
      let errors = [];
      if (!notBulma.Form.validator.isLength(value, {
          min: 11
        })) {
        errors.push('Необходимо ввести полный номер телефона из 11 цифр');
      }
      return errors;
    },
    story(value) {
      let errors = [];
      if (!notBulma.Form.validator.isLength(value, {
          min: 6,
          max: 100
        })) {
        errors.push('Текст должен содержать от 6 до 100 сиволов.');
      }
      return errors;
    },
    email(value) {
      let errors = [];
      if (!notBulma.Form.validator.isEmail(value)) {
        errors.push('Необходимо ввести email адрес');
      }
      return errors;
    },
    agreed() {
      return [];
    },
    favoriteColor() {
      return [];
    },
    beenToKerch() {
      return [];
    },
    country(value) {
      let errors = [];
      if ([1, 2, 3, 4].indexOf(parseInt(value)) === -1) {
        errors.push('Необходимо выбрать страну');
      }
      return errors;
    }
  },
  forms:{
    edit(form) {
      let errors = {
        clean: true,
        fields: {},
        form: []
      };
      if (form.password !== form.password2) {
        errors.clean = false;
        errors.fields.password = ['Пароли должны совпадать'];
        errors.fields.password2 = ['Пароли должны совпадать'];
        errors.form.push('Некоторые поля заполнены не корректно');
      }
      if (form.agreed !== true) {
        errors.clean = false;
        errors.fields.agreed = ['Необходимо подтвердить согласие с правилами использования'];
      }
      if (form.beenToKerch !== true) {
        errors.clean = false;
        errors.fields.beenToKerch = ['Вам необходимо побывать в Керчи. Срочно.'];
      }
      return errors;
    }
  }
};

window.Validators=Validators;
export default Validators;
