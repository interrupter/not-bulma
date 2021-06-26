const ERROR_DEFAULT = 'Что пошло не так.';

import notTable from './table/notTable.js';
import Breadcrumbs from './breadcrumbs.js';
import UIError from './ui.error.svelte';
import UISuccess from './ui.success.svelte';
import Form from './form.js';

import notController from './frame/controller.js';
import notCommon from './frame/common.js';

const BREADCRUMBS = [];

class ncCRUD extends notController {
  constructor(app, name) {
    super(app, `CRUD.${name}`);
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

  static ERROR_DEFAULT = 'Что пошло не так.';

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

  afterAction(action = 'list'){
    let navBack = this.app.getOptions('crud.navigateBackAfter', []);
    if(navBack && Array.isArray(navBack) && navBack.indexOf(action) > -1){
      window.history.back();
    }else{
      this.backToList();
    }
  }

  linkBackToList() {
    return this.getModelURL();
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

  async preloadVariants(type = 'list'){
    try{
      if (['create','update','list','delete','details'].indexOf(type)===-1) { return; }
      let preload = this.getOptions(`${type}.preload`, {});
      if(Object.keys(preload).length == 0){
        preload = this.getOptions(`preload`, {});
      }
      if(Object.keys(preload).length > 0){
        let libProps = Object.keys(preload);
        let proms = [];
        libProps.forEach((prop)=>{
          let modelName = notCommon.lowerFirstLetter(preload[prop]);
          let Model = this.make[modelName]({});
          proms.push(Model.$listAll());
        });
        let results = await Promise.all(proms);
        for(let i = 0; i < libProps.length; i++){
          if(Array.isArray(results[i])){
            Form.addVariants(libProps[i], results[i].map(item => {
              return {id: item._id, title: item.title};
            }));
          }
        }
      }
      this.log('preload finished');
    }catch(e){
      this.error(e);
    }
  }

  getTitleFromLib(propName, id){
    return Form.getVariantTitle(propName, id);
  }

  createDefault() {
    let newRecord = this.getModel({
      '_id': null,
      title: this.getOptions('names.single'),
      products: []
    });
    return newRecord;
  }

  getItemTitle(item){
    if(Object.prototype.hasOwnProperty.call(item, 'title') && (typeof item.title === 'string')){
      return item.title;
    }else if(Object.prototype.hasOwnProperty.call(item, 'label') && (typeof item.label === 'string')){
      return item.label;
    }else if(Object.prototype.hasOwnProperty.call(item, 'id') && (typeof item.id === 'string')){
      return item.id;
    }else if(Object.prototype.hasOwnProperty.call(item, 'name') && (typeof item.name === 'string')){
      return item.name;
    }
  }

  route(params = []) {
    if (params.length == 1) {
      if (params[0] === 'create') {
        return this.runCreate(params);
      } else {
        return this.runDetails(params);
      }
    } else if (params.length > 1) {
      if (params[1] === 'delete') {
        return this.runDelete(params);
      } else if (params[1] === 'update') {
        return this.runUpdate(params);
      } else {
        let routeRunnerName = 'run' + notCommon.capitalizeFirstLetter(params[1]);
        if (this[routeRunnerName] && typeof this[routeRunnerName] === 'function') {
          return this[routeRunnerName](params);
        }
      }
    }
    return this.runList(params);
  }

  async runCreate() {
    await this.preloadVariants('create');
    this.setBreadcrumbs([{
      title: 'Добавление',
      url: this.getModelActionURL(false, 'create')
    }]);
    if (this.ui.create) {
      return;
    } else {
      this.$destroyUI();
    }
    let defData = this.createDefault();
    if(defData.getData){
      defData = defData.getData();
    }
    let manifest = this.app.getInterfaceManifest()[this.getModelName()];
    this.ui.create = Form.build({
      target: this.els.main,
      manifest,
      action: 'create',
      options: {},
      validators: this.getOptions('Validators'),
      data:defData
    });
    this.ui.create.$on('submit', (ev) => this.onCreateFormSubmit(ev.detail));
    this.ui.create.$on('reject', this.goList.bind(this));
    this.emit('after:render:create');
  }

  async runDetails(params) {
    let idField = this.getOptions('details.idField', '_id'),
      query = {};
    await this.preloadVariants('details');
    this.setBreadcrumbs([{
      title: 'Просмотр',
      url: this.getModelActionURL(params[0], false)
    }]);

    if (this.ui.details) {
      return;
    } else {
      this.$destroyUI();
    }
    let manifest = this.app.getInterfaceManifest()[this.getModelName()];
    query[idField] = params[0];
    this.getModel(query)['$get']()
      .then((res) => {
        if (res.status === 'ok') {
          let title = this.getItemTitle(res.result);
          this.setBreadcrumbs([{
            title: `Просмотр "${title}"`,
            url: this.getModelActionURL(params[0], false)
          }]);
          this.ui.details = Form.build({
            target: this.els.main,
            manifest,
            action: 'get',
            options: {
              readonly: true
            },
            validators: this.getOptions('Validators'),
            data: res.result
          });
          this.emit('after:render:details');
          this.ui.details.$on('reject', this.goList.bind(this));
        } else {
          this.showErrorMessage(res);
        }
      })
      .catch(this.error.bind(this));
  }

  async runUpdate(params) {
    let idField = this.getOptions('update.idField', '_id'),
      query = {};
    await this.preloadVariants('update');
    this.setBreadcrumbs([{
      title: 'Редактирование',
      url: this.getModelActionURL(params[0], 'update')
    }]);

    if (this.ui.update) {
      return;
    } else {
      this.$destroyUI();
    }
    let manifest = this.app.getInterfaceManifest()[this.getModelName()];
    query[idField] = params[0];
    this.getModel(query).$getRaw().then((res) => {
      if (res.status === 'ok') {
        let title = this.getItemTitle(res.result);
        this.setBreadcrumbs([{
          title: `Редактирование "${title}"`,
          url: this.getModelActionURL(params[0], 'update')
        }]);

        this.ui.update = Form.build({
          target: this.els.main,
          manifest,
          action: 'update',
          options: {},
          validators: this.getOptions('Validators'),
          data: notCommon.stripProxy(res.result)
        });

        this.ui.update.$on('submit', (ev) => {
          this.onUpdateFormSubmit(ev.detail);
        });

        this.ui.update.$on('reject', this.goList.bind(this));

        this.emit('after:render:update');
      } else {
        this.showErrorMessage(res);
      }
    })
      .catch(this.error.bind(this));
  }

  async runDelete(params) {
    await this.preloadVariants('delete');
    this.setBreadcrumbs([{
      title: 'Удаление',
      url: this.getModelActionURL(params[0], 'delete')
    }]);

    if (confirm('Удалить запись?')) {
      this.getModel({
        _id: params[0]
      }).$delete()
        .then(() => {
          this.goList();
        })
        .catch((e) => {
          this.error(e);
          this.goList();
        });
    } else {
      this.goList();
    }
  }

  async runList() {
    await this.preloadVariants('list');
    this.setBreadcrumbs([{
      title: 'Список',
      url: this.getModelURL()
    }]);

    if (this.ui.list) {
      return;
    } else {
      this.$destroyUI();
    }
    const DEFAULT_OPTIONS_TABLE = {
      interface: {
        combined: true,
        factory: this.getInterface()
      },
      /*
      fields:       undefined,
      showSelect:   undefined,
      getItemId:     undefined,
      idField:       undefined,
      filter:       undefined,
      */
      preload:       {},
      pager:         { size: 50, page: 0},
      sorter:       {
        id: -1
      },
    };

    const TABLE_OPTIONS = {
      options: {
        targetEl: this.els.main,
        endless: false,
        actions: [
          {
            title: 'Создать',
            action: this.goCreate.bind(this)
          },
          ...(this.getOptions('list.actions', []))
        ],
      }
    };

    Object.keys(DEFAULT_OPTIONS_TABLE).forEach(key=>{
      TABLE_OPTIONS.options[key] = this.getOptions(`list.${key}`, DEFAULT_OPTIONS_TABLE[key]);
    });

    this.ui.list = new notTable(TABLE_OPTIONS);
    this.emit('after:render:list');
  }

  goCreate() {
    this.app.getWorking('router').navigate(this.getModelActionURL(false, 'create'));
  }

  goDetails(value) {
    this.app.getWorking('router').navigate(this.getModelActionURL(value, false));
  }

  goUpdate(value) {
    this.app.getWorking('router').navigate(this.getModelActionURL(value, 'update'));
  }

  goDelete(value) {
    this.app.getWorking('router').navigate(this.getModelActionURL(value, 'delete'));
  }

  goList() {
    this.app.getWorking('router').navigate(this.getModelURL());
  }

  onCreateFormSubmit(item) {
    this.ui.create.setLoading();
    this.getModel(item).$create()
      .then((res) => {
        this.log(res);
        this.showResult(this.ui.create, res);
        if (!notCommon.isError(res)) {
          setTimeout(() => this.goList(this.app), 3000);
        }
      })
      .catch((e) => {
        this.showResult(this.ui.create, e);
      });
  }

  onUpdateFormSubmit(item) {
    this.ui.update.setLoading();
    this.getModel(item).$update()
      .then((res) => {
        this.showResult(this.ui.update, res);
        if (!notCommon.isError(res) && !res.error) {
          setTimeout(() => this.goList(this.app), 3000);
        }
      })
      .catch((e) => {
        this.showResult(this.ui.update, e);
      });
  }

  showResult(ui, res) {
    ui.resetLoading();
    if (notCommon.isError(res)) {
      notCommon.report(res);
      ui.addFormError(res.message);
    } else {
      if(Object.prototype.hasOwnProperty.call(res, 'status')){
        if(res.status === 'error'){
          if (!Array.isArray(res.error)) {
            res.error = [ERROR_DEFAULT];
          }
          ui.addFormError(res.error);
        }else if(res.status === 'ok'){
          ui.showSuccess();
        }
      }else{
        this.processFieldsErrors(ui, res);
        if (res.error) {
          ui.addFormError(res.error);
        }
        if (!res.error) {
          ui.showSuccess();
        }
      }
    }
  }

  processFieldsErrors(ui, res){
    if (res.errors && Object.keys(res.errors).length > 0) {
      if (!Array.isArray(res.error)) {
        res.error = [];
      }
      Object.keys(res.errors).forEach((fieldName) => {
        ui.setFieldInvalid(fieldName, res.errors[fieldName]);
        res.error.push(...res.errors[fieldName]);
      });
    }
  }


  $destroyUI() {
    for (let name in this.ui) {
      this.ui[name].$destroy && this.ui[name].$destroy();
      delete this.ui[name];
    }
  }

  showErrorMessage(res){
    this.error(res);
    this.ui.error = new UIError({
      target: this.els.main,
      props: {
        title: 'Произошла ошибка',
        message: res.error ? res.error : ERROR_DEFAULT
      }
    });
  }

  showSuccessMessage(title, message){
    this.ui.success = new UISuccess({
      target: this.els.main,
      props: {
        title,
        message
      }
    });
  }

}

export default ncCRUD;
