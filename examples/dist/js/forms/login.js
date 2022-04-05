/* global notBulma */

import waiter from './waiter.js';
const { notForm, notCommon } = notBulma.Frame;

import Manifest from './manifest.js';
import ValidatorsLib from './simple.validators.js';

export default class LoginForm extends notForm {
  constructor({ data = {}, options = {} }) {
    options.action = 'login';
    options.manifest = Manifest;
    super({
      name: 'Login',
      options,
      data
    });
    //events after user button actions
    this.on('submit', e => this.onSubmit(e));
  }

  getFormValidators() {
    return ValidatorsLib;
  }

  async onSubmit(data) {
    try {
      this.setLoading();
      //do some stuff with data
      await waiter(1000);
      //maybe error or success
      this.processResult(results);
    } catch (e) {
      //if exactly error
      this.processResult(e);
    } finally {
      //should unlock UI anyway
      this.resetLoading();
    }
  }

}