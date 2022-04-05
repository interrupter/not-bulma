export default {
  model: 'user',
  fields: {
    login: {
      component: 'UITextfield',
      label: 'login'
    },
    password: {
      component: 'UIPassword',
      label: 'password'
    },
    password2: {
      component: 'UIPassword',
      label: 'password again'
    },
    telephone: {
      component: 'UITelephone',
      placeholder: 'not-node:field_telephone_placeholder',
      label: 'not-node:field_telephone_label'
    },
    email: {
      component: 'UIEmail',
      placeholder: 'not-node:field_email_placeholder',
      label: 'not-node:field_email_label'
    },
    country: {
      component: 'UISelect',
      placeholder: 'not-node:field_country_placeholder',
      label: 'not-node:field_country_label',
      variants: [{
        id: 1,
        title: 'UI'
      }, {
        id: 2,
        title: 'DU'
      }, {
        id: 3,
        title: 'KU'
      }, {
        id: 4,
        title: 'UL'
      }]
    }
  },
  actions: {
    login: {
      fields: ['login', 'password']
    },
    register: {
      fields: ['login', ['email', 'telephone'], ['password', 'password2'], 'country']
    },
    restore: {
      fields: ['email']
    }
  }
};