/* global notBulma */
if (!window.EXAMPLES) {
  window.EXAMPLES = {};
}
import ValidatorsLib from './forms/simple.validators.js';
import LoginForm from './forms/login.js';
import RegisterForm from './forms/register.js';
import RestoreForm from './forms/restore.js';

const FormSetExamples = [
  {
    title: 'Login / Register / Restore',
    description: 'various forms in one block',
    functions: true,
    props: [
      (target)=>{
        console.log('rendering example for loading notForm in', target);
        const formSet = new notBulma.Frame.notFormSet({
          options: {
            name: 'Login-Register-Restore-Custom',
            target: '#' + target.id,
            forms: [
              {
                mode: 'login',
                title: 'Login',
                form: LoginForm //custom constructors
              }, {
                mode: 'register',
                title: 'Register',
                form: RegisterForm
              }, {
                mode: 'restore',
                title: 'Restore',
                form: RestoreForm
              }
            ]
          }
        });
      }
    ]
  },
];

window.EXAMPLES.notFormSet = {
  constructor: 'Frame.notFormSet',
  list: FormSetExamples
};
