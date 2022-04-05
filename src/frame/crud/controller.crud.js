import UICommon from '../../elements/common';

import Breadcrumbs from '../components/breadcrumbs';

import {notForm, notTable, notFormUtils} from '../components';

import notController from '../controller';
import notCommon from '../common';

import CRUDVariantsPreloader from './variants.preloader.js';
import CRUDRouter from './router.js';
import CRUDMessage from './message.js';
import * as CRUDActions from './actions';

const BREADCRUMBS = [];
const TITLE_FIELDS_PRIORITY = ['title', 'label', 'id', 'name'];

class notCRUD extends notController {

  #actions = {...CRUDActions};
  #router = CRUDRouter;
  #preloader = CRUDVariantsPreloader;

  TITLE_FIELDS_PRIORITY = TITLE_FIELDS_PRIORITY;
  static ERROR_DEFAULT = UICommon.ERROR_DEFAULT;

  constructor(app, name, { actions, router, preloader}) {
    super(app, `CRUD.${name}`);
    if(actions){
      this.#actions = {...this.#actions, ...actions};
    }
    if(router){
      this.#router = router;
    }
    if(preloader){
      this.#preloader = preloader;
    }
    this.ui = {};
    this.els = {};
    this.setOptions('names', {
      module: '',
      plural: 'plural',
      single: 'single',
    });
    this.setOptions('containerSelector', this.app.getOptions('crud.containerSelector'));
    this.buildFrame();
    return this;
  }

  start(){
    let newHead = [];
    if(this.getModuleName() && this.getOptions('names.module')){
      newHead.push({
        title: this.getOptions('names.module'),
        url: false
      });
    }
    newHead.push({
      title: this.getOptions('names.plural'),
      url: this.getModelURL()
    });
    BREADCRUMBS.splice(0, BREADCRUMBS.length, ...newHead);
    Breadcrumbs.setHead(BREADCRUMBS).render({
      root: '',
      target: this.els.top,
      navigate: (url) => this.app.getWorking('router').navigate(url)
    });
    this.route(this.getOptions('params'));
  }

  setBreadcrumbs(tail) {
    Breadcrumbs.setTail(tail).update();
  }

  backToList() {
    this.app.getWorking('router').navigate(this.linkBackToList());
  }

  linkBackToList() {
    return this.getModelURL();
  }

  afterAction(action = 'list'){
    let navBack = this.app.getOptions('crud.navigateBackAfter', []);
    if(navBack && Array.isArray(navBack) && navBack.indexOf(action) > -1){
      window.history.back();
    }else{
      this.backToList();
    }
  }

  buildFrame() {
    let el = document.querySelector(this.app.getOptions('crud.containerSelector', 'body'));
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
    this.els.top = document.createElement('div');
    this.els.top.id = 'crud-top';
    this.els.top.classList.add('box');
    el.appendChild(this.els.top);
    this.els.main = document.createElement('div');
    this.els.main.id = 'crud-main';
    this.els.main.classList.add('box');
    el.appendChild(this.els.main);
    this.els.bottom = document.createElement('div');
    this.els.bottom.id = 'crud-bottom';
    this.els.bottom.classList.add('box');
    el.appendChild(this.els.bottom);
  }

  getContainerTopElement(){
    return this.els.top;
  }

  getContainerInnerElement(){
    return this.els.main;
  }

  getContainerBottomElement(){
    return this.els.bottom;
  }

  async preloadVariants(type = 'list'){
    await this.#preloader.preload(this, type);
  }

  getTitleFromLib(propName, id){
    throw new Error('not suported anymore');
    //return Form.getVariant(propName, id).title;
  }

  getItemTitle(item){
    const fieldName = this.TITLE_FIELDS_PRIORITY.find(
      (key) => notCommon.objHas(item, key)
    );
    if(fieldName){
      return item[fieldName];
    }else{
      return '';
    }
  }

  createDefault() {
    let newRecord = this.getModel({
      '_id': null,
      title: this.getOptions('names.single'),
      products: []
    });
    return newRecord;
  }

  route(params = []) {
    try{
      return this.#router.route(this, params);
    }catch(e){
      this.report(e);
      this.showErrorMessage(e);
    }
  }

  runAction(actionName, params){
    if(Object.keys(this.#actions).includes(actionName)){
      return this.#actions[actionName].run(this, params)
    }else if(typeof this['run'+ notCommon.capitalizeFirstLetter(actionName)]){
      throw new Error(`No such action: ${actionName} in contoller ${this.getWorking('name')}`);
    }
  }

  goCreate() {
    this.$destroyUI();
    this.app.getWorking('router').navigate(this.getModelActionURL(false, 'create'));
  }

  goDetails(value) {
    this.$destroyUI();
    this.app.getWorking('router').navigate(this.getModelActionURL(value, false));
  }

  goUpdate(value) {
    this.$destroyUI();
    this.app.getWorking('router').navigate(this.getModelActionURL(value, 'update'));
  }

  goDelete(value) {
    this.$destroyUI();
    this.app.getWorking('router').navigate(this.getModelActionURL(value, 'delete'));
  }

  goList() {
    this.$destroyUI();
    this.app.getWorking('router').navigate(this.getModelURL());
  }

  async onActionSubmit(action, item){
    let result = true;
    const actionUI = this.ui[action];
    if(actionUI){
      try{
        actionUI.setLoading();
        let result = await this.getModel(item)[`$${action}`]();
        state = actionUI.processResult(result);
      }catch(e){
        state = actionUI.processResult(e);
      }finally{
        actionUI.resetLoading();
        return state;
      }
    }
    throw new Error('Action UI doesnt exist');
  }

  $destroyUI() {
    for (let name in this.ui) {
      this.ui[name].$destroy && this.ui[name].$destroy();
      this.ui[name].destroy && this.ui[name].destroy();
      delete this.ui[name];
    }
  }

  showErrorMessage(res){
    this.error(res);
    CRUDMessage.error(
      this,
      'Произошла ошибка',
      res.message ? res.message : UICommon.ERROR_DEFAULT
    );
  }

  showSuccessMessage(title, message){
    CRUDMessage.success(
      this,
      title,
      message
    );
  }

  setUI(name, val){
    this.$destroyUI();
    this.ui[name] = val;
  }

  getActionUI(){
    return this.ui[this.getCurrentAction()];
  }

}

export default notCRUD;
