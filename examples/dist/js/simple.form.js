if (!window.EXAMPLES) {
  window.EXAMPLES = {};
}

const FormExamples = [{
  title: 'Simple',
  description: 'Simple',
  props: [{
    fields: [['nameFirst', 'nameLast'], ['email', 'telephone'], 'country'],
    form: {
      nameFirst: {
        component: 'UITextfield',
        label: 'First name',
        enabled: true,
        visible: true,
        required: true,
        validated: false,
        valid: true,
        errors: false,
        value: ''
      },
      nameLast: {
        component: 'UITextfield',
        label: 'Last name',
        enabled: true,
        visible: true,
        required: true,
        validated: false,
        valid: true,
        errors: false,
        value: ''
      },
      country: {
        component: 'UISelect',
        multiple: false,
        variantsSource: 'countries',
        label: 'country_name',
        enabled: true,
        visible: true,
        required: true,
        validated: false,
        valid: true,
        errors: false,
        value: 2,
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
      },
      telephone: {
        component: 'UITelephone',
        placeholder: 'not-node:field_telephone_placeholder',
        label: 'not-node:field_telephone_label',
        enabled: true,
        visible: true,
        required: true,
        validated: false,
        valid: true,
        errors: false,
        value: ''
      },
      email: {
        component: 'UIEmail',
        placeholder: 'not-node:field_email_placeholder',
        label: 'not-node:field_email_label',
        enabled: true,
        visible: true,
        required: true,
        validated: false,
        valid: true,
        errors: false,
        value: ''
      }
    }
  }]
}];

window.EXAMPLES.UIForm = {
  constructor: 'Frame.UIForm',
  list: FormExamples
};