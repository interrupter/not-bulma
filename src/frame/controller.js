import notCommon from './common.js';
import notBase from './base.js';

/**
 * @const {string}  OPT_DEFAULT_ACTION_NAME      default action name
 */
const OPT_DEFAULT_ACTION_NAME = 'default';

/**
 * @const {string}  OPT_DEFAULT_CONTAINER_SELECTOR  selector of container HTML
 *                          element
 */
const OPT_DEFAULT_CONTAINER_SELECTOR = 'main.content';

/**
 * @const {string}  OPT_DEFAULT_PLURAL_NAME  default plural name of entities
 */
const OPT_DEFAULT_PLURAL_NAME = 'Models';

/**
 * @const {string}  OPT_DEFAULT_SINGLE_NAME  default single name of entities
 */
const OPT_DEFAULT_SINGLE_NAME = 'Model';

/**
 * @const {string}  OPT_DEFAULT_MODULE_NAME  default module name
 */
const OPT_DEFAULT_MODULE_NAME = 'main';

/**
 * @const {boolean}  OPT_DEFAULT_AUTO_NAME  if shoould be used auto name generator
 */
const OPT_DEFAULT_AUTO_NAME = true;

/*
 *  Basic class for user controller
 */
class notController extends notBase {
  /**
   *  @static {number} PARAMS_LENGTH  number of params in URL path
   */
  static PARAMS_LENGTH = 2;
  /**
   *  @static {string} MODULE_NAME  name of module
   */
  static MODULE_NAME = 'MODULE_NAME';
  /**
   *  @static {string} MODEL_NAME  name of model
   */
  static MODEL_NAME = 'MODEL_NAME';
  /**
   *  @param {notApp} app
   */
  constructor(app, name) {
    super({
      working: {
        name
      }
    });
    this.app = app;
    this.app.setCurrentController(this);
    this.setWorking({
      ready: false,
      views: {},
      libs: {},
      helpers: {}
    });
    this.ui = {};
    this.els = {};
    this.setData({});
    this.setOptions({
      moduleName: OPT_DEFAULT_MODULE_NAME,
      containerSelector: OPT_DEFAULT_CONTAINER_SELECTOR,
      prefix: app.getOptions('paths.module'),
      names: {
        plural: OPT_DEFAULT_PLURAL_NAME,
        single: OPT_DEFAULT_SINGLE_NAME
      }
    });
    this.setURLPrefix(app.getOptions('router.root'));
    /*
      сразу делаем доступными модели notRecord из nc`ControllerName` будут доступны как this.nr`ModelName`
    */
    let interfaces = app.getInterfaces();
    this.make = {};
    for (let t in interfaces) {
      if (Object.prototype.hasOwnProperty.call(interfaces, t)) {
        this.make[t] = interfaces[t];
      }
    }
    return this;
  }

  /**
   *  Returns current notApp
   *  @return {notApp}
   */
  getApp() {
    return notCommon.getApp();
  }

  /**
   *  Sets default controller model
   *  @param {notRecord}  model  notRecord interface object
   *  @return {notController}
   */
  setModel(model) {
    this.setWorking('model', model);
    return this;
  }

  /**
   *  Returns current model
   *  @param {object} data   model data
   *  @return {notRecord}
   */
  getModel(name, data){
    if(typeof name === 'string'){
      return this.getInterface(name)(data || {});
    }else{
      return this.getInterface()(name || {});
    }
  }

  getInterface(name = false){
    return this.app.getInterface(name || this.getModelName());
  }

  /**
   *  Returns current model name
   *  @return {notRecord}
   */
  getModelName() {
    return this.getWorking('modelName');
  }
  /**
   *  Sets default controller model name
   *  @param {string}  modelName  notRecord interface object
   *  @return {notController}
   */
  setModelName(modelName) {
    this.setWorking('modelName', notCommon.lowerFirstLetter(modelName));
    return this;
  }

  /**
   *  Returns current model primary ID field name
   *  @return {notRecord}
   */
  getModelIDFieldName() {
    return this.getWorking('modelIDFieldName', '_id');
  }

  /**
   *  Sets current model primary ID field name
   *  @return {notRecord}
   */
  setModelIDFieldName(val = '_id') {
    return this.setWorking('modelIDFieldName', val);
  }

  /**
   *  Marks this controller as ready
   *  emits "ready"/"busy" events
   *  @param {Boolean}  val  true/false
   */
  setReady(val = true) {
    this.setWorking('ready', val);
    val ? this.emit('ready') : this.emit('busy');
  }

  /**
   *  Sets module URL prefix
   *  @param {sting} val URL prefix
   *  @return {notController} this
   */
  setURLPrefix(val) {
    this.setOptions('urlPrefix', val);
    this.updateAutoName();
    return this;
  }

  /**
   *  Returns module url prefix
   *  @return  {string} prefix
   */
  getURLPrefix() {
    return this.getOptions('urlPrefix');
  }

  /**
   *  Sets module name
   *  @param {sting} val name of the module
   *  @return {notController} this
   */
  setModuleName(val) {
    this.setOptions('moduleName', notCommon.lowerFirstLetter(val));
    this.updateAutoName();
    return this;
  }
  /**
   *  Returns module name
   *  @return  {string} module name
   */
  getModuleName() {
    return this.getOptions('moduleName');
  }

  /**
   *  Returns this module path prefix
   *  @return {string}  path to module dir
   */
  getModulePrefix() {
    return [notCommon.getApp().getOptions('paths.modules'), this.getModuleName()].join('/');
  }

  /**
   *  Returns this model URL with URL prefix
   *  @return {string}  url path
   */
  getModelURL() {
    return notCommon.buildURL({
      prefix: this.getURLPrefix(),
      module: this.getModuleName(),
      model: this.getModelName(),
    });
  }

  /**
   *  Returns this model action URL with URL prefix
   * @param  {string}   id       some identificator of model
   * @param  {string}   action   action name
   *  @return {string}  url path
   */
  getModelActionURL(id, action = false) {
    return notCommon.buildURL({
      prefix: this.getURLPrefix(),
      module: this.getModuleName(),
      model: this.getModelName(),
      id,
      action
    });
  }

  buildURL(val) {
    return notCommon.buildURL(val);
  }

  /**
   *  Updates working name
   *  @param {sting} val name of the module
   *  @return {notController} this
   */
  updateAutoName() {
    if (this.getOptions('autoName', OPT_DEFAULT_AUTO_NAME)) {
      this.setWorking('name', this.getModelURL());
    }
  }

  /**
   *  Sets object name
   *  @param {sting} val name of the object
   *  @return {notController} this
   */
  setName(val) {
    this.setWorking('name', val);
    this.setOptions('autoName', false);
    return this;
  }

  /**
   *  Preload records from server, using listAll method,
   *  returns Promise
   *  @param {object}  list  map of preloaded records
   *  @return {Promise}
   */
  preloadLib(list = {}) {
    return new Promise((resolve, reject) => {
      if (typeof list !== 'object') {
        resolve();
      } else {
        this.setWorking('loading', []);
        for (let t in list) {
          this.getWorking('loading').push(list[t]);
          this.make[list[t]]({}).$listAll()
            .then((data) => {
              if (!this.getOptions('libs')) {
                this.setOptions('libs', {});
              }
              this.getOptions('libs')[t] = data;
              if (this.getWorking('loading').indexOf(list[t]) > -1) {
                this.getWorking('loading').splice(this.getWorking('loading').indexOf(list[t]), 1);
              }
              if (this.getWorking('loading').length === 0) {
                resolve();
              }
            })
            .catch((err) => {
              this.report(err);
              reject();
            });
        }
        if (this.getWorking('loading').length === 0) {
          resolve();
        }
      }
    });
  }

  /**
   * emits afterRender event
   */
  onAfterRender() {
    this.emit('afterRender');
  }

  /**
   *  Transform route name in action name
   *  @param {String}   name tranform action name
   *  @return {String}
   */
  getActionName(name = OPT_DEFAULT_ACTION_NAME) {
    return 'run' + notCommon.capitalizeFirstLetter(name);
  }

  /**
   *  Get default controller action name
   *  @return {String} default action from options
   */
  getDefaultActionName() {
    return this.getActionName(this.getOptions('defaultAction', OPT_DEFAULT_ACTION_NAME));
  }

  /**
   *  Route params into specific run[Route_name] function
   *  @param {array}   params   controller input params
   *  @return {undefined}
   */
  route(params) {
    let [routerName, ...subParams] = params,
      actionName = this.getActionName(routerName ? routerName : OPT_DEFAULT_ACTION_NAME);
    if (typeof this[actionName] === 'function') {
      this[actionName](subParams);
    } else if (this[this.getDefaultActionName()]) {
      this[this.getDefaultActionName()](subParams);
    } else {
      this.error('No action in router', params);
    }
  }

  /**
   *  Return application options
   *  @return {object}
   */
  getAppOptions() {
    try {
      return this.getApp().getOptions();
    } catch (e) {
      this.error(e);
    }
  }

  /**
   *  Returns module options
   *  @param  {string}   moduleName    name of the module which options requested
   *  @return {object}
   */

  getModuleOptions(moduleName) {
    try {
      return this.getApp().getOptions(['modules', moduleName || this.getModuleName()].join('.'));
    } catch (e) {
      this.error(e);
    }
  }

  /**
   *  Returns module services
   *  @param  {string}   moduleName    name of the module which services requested
   *  @return {object}
   */

  getServices(moduleName) {
    try {
      return this.getApp().getOptions(['services', moduleName || this.getModuleName()].join('.'));
    } catch (e) {
      this.error(e);
    }
  }

  /**
   *  Returns module components
   *  @param  {string}   moduleName    name of the module which components requested
   *  @return {object}
   */

  getComponents(moduleName) {
    try {
      return this.getApp().getOptions(['components', moduleName || this.getModuleName()].join('.'));
    } catch (e) {
      this.error(e);
    }
  }

  /**
   *  Refreshes current URL, re-run all action
   *  @param {integer} timeout time to wait in ms
   */
  refresh(timeout = 0) {
    this.app.getWorking('router').refresh(timeout);
  }

  /**
  * Returns path pattern for router
  * @params {number} [0] paramsCount   number of params
  * @return {string}  pattern for controller supported url
  */
  static getControllerRoute(paramsCount = 0){
    let path = [];
    if(this.MODULE_NAME && this.MODULE_NAME.length > 0){
      path.push(notCommon.lowerFirstLetter(this.MODULE_NAME));
    }
    if(this.MODEL_NAME && this.MODEL_NAME.length > 0){
      path.push(notCommon.lowerFirstLetter(this.MODEL_NAME));
    }
    path = [path.join('/')];
    for(let i = 0; i < paramsCount; i++){
      path.push('\/([^\/]+)');
    }
    return path.join('');
  }

  /**
  * Returns path patterns for router
  * @params {number} [0] paramsDeep   how many paths with params in the end
  * @return {string[]}  patterns for controller supported url in order of simplification
  */
  static getControllerRoutes(paramsDeep = 0){
    let routes = [this.getControllerRoute(0)];
    for(let i = 0; i < paramsDeep; i++){
      routes.unshift(this.getControllerRoute(i + 1));
    }
    return routes;
  }

  /**
  * Returns router rule.
  * @returns {Object} router rule {paths:String[], controller:notController}
  */
  static getRoutes(){
    return {
      paths:      this.getControllerRoutes(this.PARAMS_LENGTH),
      controller: this
    };
  }

}

export default notController;
