/* global notBulma */

const {notForm, notCommon} = notBulma.Frame;

import loadMyCountries from './load.countries.js';
import ValidatorsLib from './simple.validators.js';

export default class SimpleForm extends notForm{
  constructor(data = {}, options = {}){
    options.target = '#simple-form';
    options.autoInit = false;
    options.action = 'create';
    options.model = 'simpleInterface';
    options.ui = {
      horizontal: true,
    };
    options.fields = {
      mutations: {
        nameFirst: {
          value: 'Von Graf',
          readonly: true
        },
      }
    };
    super({
      name:'My',
      options,
      data
    });
    this.loadVariants();
    //events after user button actions
    this.on('submit', e => this.onSubmit(e));
    this.on('reject', e => this.onReject(e));
    //after result processing
    this.on('success', e => this.onSuccess(e));
    this.on('error', e => this.onError(e));
  }

  async loadVariants(){
    try{
      const response = await loadMyCountries();
      if(response.status === 'ok'){
        this.setOptions('variants.country', response.result); //listOfVariants:Array<Object>
        this.reInit();
      }else{
        throw response;
      }
    }catch(e){
      this.resetLoading();
      this.setFormErrors(e);
    }
  }

  getFormValidators(){
    return ValidatorsLib;
  }

  getFormManifest(){
    return {
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
    };
  }

  async onSubmit(data){
    try{
      this.setLoading();
      //do some stuff with data
      const results = await this.submitToServer(data);
      //maybe error or success
      this.processResult(results);
    }catch(e){
      //if exactly error
      this.processResult(e);
    }finally{
      //should unlock UI anyway
      this.resetLoading();
    }
  }

  onReject(e){
    notCommon.getApp().getWorking('router').navigate('/back_link');
  }

  onError(status){
    //do nothing
    this.log(status);
  }

  onSuccess(){
    //onward
    notCommon.getApp().getWorking('router').navigate('/success_link');
  }

}
