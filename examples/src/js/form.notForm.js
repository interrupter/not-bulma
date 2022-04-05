/* global notBulma */
if (!window.EXAMPLES) {
  window.EXAMPLES = {};
}

import ValidatorsLib from './forms/simple.validators.js';

const FormExamples = [
  {
    title: 'Login',
    description: 'Login form with horizontal fields and in container loader',
    functions: true,
    props: [
      (target)=>{
        console.log('rendering example for loading notForm in', target);
        const form = new notBulma.Frame.notForm({
          options:{
            name: 'Login',
            validators: ValidatorsLib,
            target: '#'+target.id,
            manifest: {
              model: 'simpleInterface',
              fields: {
                login: {
                  component: 'UITextfield',
                  label: 'login'
                },
                password: {
                  component: 'UIPassword',
                  label: 'password'
                },
              },
              actions: {
                login:{
                  fields: [['login','password']]
                }
              },
            },
            action: 'login',
            ui:{
              loader: 'container',
              horizontal: true,
            }
          }
        });
        let t = 0;
        form.on('submit', (data)=>{
          form.setLoading();
          setTimeout(()=>{
            form.resetLoading();
            t++;
            if(t > 3){
              form.setFormSuccess();
            }
          }, 2000);
        });
      }
    ]
  },
  {
    title: 'Login 2',
    description: 'Vertical Login form without loader',
    functions: true,
    props: [
      (target)=>{
        console.log('rendering example for loading notForm in', target);
        const form = new notBulma.Frame.notForm({
          options:{
            name: 'Login2',
            validators: ValidatorsLib,
            target: '#'+target.id,
            manifest: {
              model: 'simpleInterface',
              fields: {
                login: {
                  component: 'UITextfield',
                  label: 'login'
                },
                password: {
                  component: 'UIPassword',
                  label: 'password'
                },
              },
              actions: {
                login:{
                  fields: ['login','password']
                }
              },
            },
            action: 'login',
            ui:{
              loader: 'hidden'
            }
          }
        });
        let t = 0;
        form.on('submit', (data)=>{
          form.setLoading();
          setTimeout(()=>{
            form.resetLoading();
            t++;
            if(t > 3){
              form.setFormSuccess();
            }
          }, 2000);
        });
      }
    ]
  },
  {
    title: 'Default',
    description: 'Default',
    functions: true,
    props: [
      (target) => {
        console.log('rendering example for notForm in', target);
        const form = new notBulma.Frame.notForm({
          options:{
            target: '#'+target.id,
            manifest: {
              model: 'simpleInterface',
              fields: {
                nameFirst: {
                  component: 'UITextfield',
                  label: 'First name'
                },
                nameLast: {
                  component: 'UITextfield',
                  label: 'Last name'
                },
                country: {
                  component: 'UISelect',
                  multiple: false,
                  variantsSource: 'countries',
                  label: 'country_name'
                },
                telephone:{
                  component: 'UITelephone',
                  placeholder: 'not-node:field_telephone_placeholder',
                  label: 'not-node:field_telephone_label'
                },
                email:{
                  component: 'UIEmail',
                  placeholder: 'not-node:field_email_placeholder',
                  label: 'not-node:field_email_label'
                },
              },
              actions: {
                create:{
                  fields: [
                    ['nameFirst', 'nameLast'],
                    ['email', 'telephone'],
                    'country'
                  ]
                }
              },
            },
            action: 'create',
            validators: ValidatorsLib,
            variants: {
              countries: [
                {
                  id: 1,
                  title: 'UI'
                },
                {
                  id: 2,
                  title: 'DU'
                },
                {
                  id: 3,
                  title: 'KU'
                },
                {
                  id: 4,
                  title: 'UL'
                },
              ]
            },
            ui:{
              loader: 'page'
            }
          }
        });
        let t = 0;
        form.on('error', val => console.error(JSON.stringify(val, null, 4)))
        form.on('submit', (data)=>{
          alert('submit');
          console.log('form data',data);
          form.setLoading();
          setTimeout(()=>{
            form.resetLoading();
            t++;
            if(t>3){
              form.setFormSuccess();
            }
          }, 2000);
        });
        form.on('reject', ()=>{
          alert('reject');
        });
        form.on('success', ()=>{
          alert('success');
        });
      }
    ],
  },
];

window.EXAMPLES.notForm = {
  constructor: 'Frame.notForm',
  list: FormExamples
};
