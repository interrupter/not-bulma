import {Runner} from 'not-validation';

import Lib from '../../lib.js';
import notCommon from '../../common';
import notBase from '../../base';
import FormFrameComponent from './form.frame.svelte';

import {
  DEFAULT_STATUS_SUCCESS,
  DEFAULT_STATUS_ERROR
} from './const';

const DEFAULT_CONTAINER_SELECTOR = '.form';
const DEFAULT_VARIANT_NAME = 'noname';

class notForm extends notBase{
  defaultAction = 'default';
  #action = 'default';
  #fields = new Lib();    //fields UI
  #variants = new Lib();  //variants for UI

  constructor({app, name}){
    super({
      working: {
        name: `${name}Form`
      }
    });
    this.app = app;
    this.initFrame();
    this.initFormMode();
  }

  /**
  * Initalizing form frame mode, with switchers between modes
  **/
  initFrame(){
    const target = this.getFrameTarget();
    if(!target){
      location.href = this.getMainURL();
    }
    target.innerHTML = '';
    this.frame = new FormFrameComponent({
      target,
      props: this.getFrameProps(mode)
    });
    this.frame.$on('action', (ev)=>{
      this.setAction(ev.detail);
    });
  }

  initFormMode(){
    this.initValidator();
    this.initUI();
  }

  initUI(){
    this.form = new UIForm({
      target: this.getFormTargetEl(),
      props: this.getFormProps({
        manifest: this.getFormManifest(),
        action: this.getFormAction(),
        options: this.getFormOptions(),
        data: this.getFormData()
      })
    });

    formUI.$on('change', async ()=>{
      try{
        const session = await formValidator.all(formUI.collectData(), action);
        formUI.updateFormValidationStatus(session.getCompleteResult());
      }catch(e){
        formUI.updateFormValidationStatus({form:[UICommon.ERROR_DEFAULT]});
        notCommon.report(e);
      }
    });
    this.form.$on('submit', (ev) => this.submit(ev.detail));
    this.form.$on('reject', () => {location.href = '/';});
  }

  initValidator(){
    const formValidator = new Runner(this.getFormValidators());
  }

  destroy(){
    delete this.app;
    delete this.form;
    delete this.validator;
    this.setOptions(null);
    this.setWorking(null);
    this.setData(null);
  }

  initFields({manifest, action, options = {}, data = null}){
    if(notCommon.objHas(manifest, 'fields')){
      this.#fields.import(manifest.fields);
    }

    if(typeof options === 'undefined' || options === null){
      options = {};
    }

    if (manifest.actions[action] && manifest.actions[action].fields){
      this.actionFieldsInit(manifest.actions[action].fields, options, data);
    }

    return {
      title:        manifest.actions[action].title,
      description:  manifest.actions[action].description,
      fields:       manifest.actions[action].fields,
      options
    };
  }

  getName(){
    return this.getWorking('name');
  }

  getFrameTargetEl(){
    return document.querySelector(this.getWorking('target', DEFAULT_CONTAINER_SELECTOR));
  }

  getFormTargetEl(){
    return document.querySelector(this.getWorking('formTarget', DEFAULT_CONTAINER_SELECTOR));
  }

  #missingOverrideWarning(missing){
    this.error(`${missing} for ${this.getWorking('name')} form is not defined`);
  }

  getFormValidators(){
    this.#missingOverrideWarning('validators');
    return {};
  }

  getFormManifest(){
    this.#missingOverrideWarning('manifest');
    return {};
  }

  getFormData(){
    this.#missingOverrideWarning('data');
    return {};
  }

  getFormAction(){
    return this.#action;
  }

  setAction(val){
    if(val !== this.#action){
      this.#action = val;
      this.form.$destroy();
      this.initFormModeAction();
    }
  }

  processResult(result){
    if(result.status === DEFAULT_STATUS_SUCCESS){
      this.frame.$set({ status: DEFAULT_STATUS_SUCCESS, message: result.message });
      this.form.showSuccess();
      //move success
    }else{
      this.setFormErrors(result);
    }
  }

  setFormErrors(result){
    const status = {
      form: [],
      fields: {}
    };
    if(result.message){
      result.form.push(result.message);
    }
    if(result.errors && Object.keys(result.errors).length > 0 ){
      result.errors = {...result.errors};
    }
    this.form.updateFormValidationStatus(status);
  }

  getVariantTitle(name, id){
    let lib = this.#variants.get(name);
    let result = lib.filter(item => item.id === id );
    return result.length === 1 ? result[0]: DEFAULT_VARIANT_NAME;
  }

}

export default notForm;
