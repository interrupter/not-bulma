/* global notBulma */

import waiter from './waiter.js';
const {notForm, notCommon} = notBulma.Frame;

import Manifest from './manifest.js';
import ValidatorsLib from './simple.validators.js';

export default class RegisterForm extends notForm{
  constructor({data = {}, options = {}}){
    options.action = 'register';
    options.manifest = Manifest;
    options.fields = {
      mutations: {
        country:{
          enabled: false,
          visible: false
        }
      }
    };
    super({
      name: 'Register',
      options,
      data
    });
    //events after user button actions
    this.on('submit', e => this.onSubmit(e));
    this.on('change.login', (value) => this.onLoginChange(value))
  }

  getFormValidators(){
    return ValidatorsLib;
  }

  async onSubmit(data){
    try{
      this.setLoading();
      //do some stuff with data
      await waiter(1000);
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

  onLoginChange(val){
    if(val === 'auslander'){
      this.addCountryField();
    }else{
      this.removeCountryField();
    }
  }

  addCountryField(){
    this.updateField('country', {visible: true, enabled: true});
  }

  removeCountryField(){
    this.updateField('country', {visible: false, enabled: false});
  }

}
