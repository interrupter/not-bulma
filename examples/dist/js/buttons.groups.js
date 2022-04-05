if (!window.EXAMPLES) {
  window.EXAMPLES = {};
}

const ButtonsExamples = [{
  title: 'Simple group',
  description: 'Buttons group',
  props: [{
    values: [{
      title: 'Button',
      color: 'primary'
    }, {
      title: 'Button',
      color: 'link'
    }, {
      title: 'Button',
      color: 'info'
    }, {
      title: 'Button',
      color: 'success'
    }, {
      title: 'Button',
      color: 'warning'
    }, {
      title: 'Button',
      color: 'danger'
    }]
  }]
}, {
  title: 'Right group',
  description: 'Buttons group',
  props: [{
    right: true,
    values: [{
      title: 'Button',
      color: 'primary'
    }, {
      title: 'Button',
      color: 'link'
    }, {
      title: 'Button',
      color: 'info'
    }, {
      title: 'Button',
      color: 'success'
    }, {
      title: 'Button',
      color: 'warning'
    }, {
      title: 'Button',
      color: 'danger'
    }]
  }]
}, {
  title: 'Centered group',
  description: 'Buttons group',
  props: [{
    centered: true,
    values: [{
      title: 'Button',
      color: 'primary'
    }, {
      title: 'Submit',
      color: 'link',
      inverted: true,
      type: 'submit'
    }, {
      title: 'Button',
      color: 'info'
    }, {
      title: 'Button',
      color: 'success'
    }, {
      title: 'Button',
      color: 'warning'
    }, {
      title: 'Button',
      color: 'danger'
    }]
  }]
}];
window.EXAMPLES.UIButtonsGroups = {
  constructor: 'Elements.Buttons.UIButtons',
  list: ButtonsExamples
};