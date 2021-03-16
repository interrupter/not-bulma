if (!window.EXAMPLES){
  window.EXAMPLES = {};
}

const ButtonsExamples = [
  {
    title: 'Simple',
    description: 'Simple',
    props: [{
      title: 'Button'
    }]
  },
  {
    title: 'Color',
    description: 'Colorized',
    props: [{
      title: 'Button',
      color: 'primary'
    },{
      title: 'Button',
      color: 'link'
    },{
      title: 'Button',
      color: 'info'
    },{
      title: 'Button',
      color: 'success'
    },{
      title: 'Button',
      color: 'warning'
    },{
      title: 'Button',
      color: 'danger'
    }]
  },
  {
    title: 'Color - light',
    description: 'Light versions',
    props: [{
      title: 'Button',
      color: 'primary',
      light: true
    },{
      title: 'Button',
      color: 'link',
      light: true
    },{
      title: 'Button',
      color: 'info',
      light: true
    },{
      title: 'Button',
      color: 'success',
      light: true
    },{
      title: 'Button',
      color: 'warning',
      light: true
    },{
      title: 'Button',
      color: 'danger',
      light: true
    }]
  },
  {
    title: 'Color - light',
    description: 'Light versions',
    props: [{
      title: 'Small',
      size: 'small'
    },{
      title: 'Default'
    },{
      title: 'Normal',
      size: 'normal'
    },{
      title: 'Medium',
      size: 'medium'
    },{
      title: 'Large',
      color: 'large'
    }]
  },
  {
    title: 'Styles - outlined',
    description: 'Outlined versions',
    props: [{
      title: 'Outlined',
      color: 'primary',
      outlined: true
    },{
      title: 'Outlined',
      color: 'link',
      outlined: true
    },{
      title: 'Outlined',
      color: 'info',
      outlined: true
    },{
      title: 'Outlined',
      color: 'success',
      outlined: true
    },{
      title: 'Outlined',
      color: 'warning',
      outlined: true
    },{
      title: 'Outlined',
      color: 'danger',
      outlined: true
    }]
  },{
    title: 'Styles - inverted',
    description: 'Inverted versions',
    props: [{
      title: 'Inverted',
      color: 'primary',
      inverted: true
    },{
      title: 'Inverted',
      color: 'link',
      inverted: true
    },{
      title: 'Inverted',
      color: 'info',
      inverted: true
    },{
      title: 'Inverted',
      color: 'success',
      inverted: true
    },{
      title: 'Inverted',
      color: 'warning',
      inverted: true
    },{
      title: 'Inverted',
      color: 'danger',
      inverted: true
    }]
  },{
    title: 'Styles - rounded',
    description: 'Rounded versions',
    props: [{
      title: 'Rounded',
      color: 'primary',
      rounded: true
    },{
      title: 'Rounded',
      color: 'link',
      rounded: true
    },{
      title: 'Rounded',
      color: 'info',
      rounded: true
    },{
      title: 'Rounded',
      color: 'success',
      rounded: true
    },{
      title: 'Rounded',
      color: 'warning',
      rounded: true
    },{
      title: 'Rounded',
      color: 'danger',
      rounded: true
    }]
  },{
    title: 'Styles - rounded',
    description: 'Rounded versions',
    props: [{
      title: 'Rounded',
      color: 'primary',
      rounded: true
    },{
      title: 'Rounded',
      color: 'link',
      rounded: true
    },{
      title: 'Rounded',
      color: 'info',
      rounded: true
    },{
      title: 'Rounded',
      color: 'success',
      rounded: true
    },{
      title: 'Rounded',
      color: 'warning',
      rounded: true
    },{
      title: 'Rounded',
      color: 'danger',
      rounded: true
    }]
  },{
    title: 'States',
    description: 'Stated versions',
    props: [{
      title: 'Normal',
      color: 'primary',
      state: 'normal'
    },{
      title: 'Hover',
      color: 'primary',
      state: 'hover'
    },{
      title: 'Focus',
      color: 'primary',
      state: 'focus'
    },{
      title: 'Active',
      color: 'primary',
      state: 'active'
    },{
      title: 'Static',
      color: 'primary',
      state: 'static'
    },{
      title: 'Loading',
      color: 'primary',
      loading: true
    }]
  },{
    title: 'Icons',
    description: 'Versions with icons',
    props: [{
      title: '',
      size: 'small',
      icon: 'bold'
    },{
      title: '',
      size: 'normal',
      icon: 'bold'
    },{
      title: '',
      size: 'medium',
      icon: 'bold'
    },{
      title: '',
      size: 'large',
      icon: 'bold'
    },{
      title: 'Trash',
      size: 'large',
      icon: 'trash'
    },{
      title: 'Trash',
      color: 'danger',
      size: 'large',
      icon: 'trash',
      inverted: true,
      iconSide: 'left'
    }]
  },{
    title: 'Action',
    description: "Action on click, will toggle element class 'is-inverted'",
    props: [{
      title: 'Click me!',
      color: 'warning',
      size: 'large',
      action: (e)=>{
        e.preventDefault();
        e.currentTarget.classList.toggle('is-inverted');
        return false;
      }
    }]
  }
];

window.EXAMPLES.UIButton = ButtonsExamples;
