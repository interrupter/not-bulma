/*
https://github.com/TehShrike/is-mergeable-object

Included for convinience only. All rights belongs to their authors and etc.
start of my code marked.

*/

let isMergeableObject = function isMergeableObject(value) {
  return isNonNullObject(value) && !isSpecial(value);
};

function isNonNullObject(value) {
  return !!value && typeof value === 'object';
}

function isSpecial(value) {
  var stringValue = Object.prototype.toString.call(value);

  return stringValue === '[object RegExp]' ||
    stringValue === '[object Date]' ||
    isReactElement(value);
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
  return value.$$typeof === REACT_ELEMENT_TYPE;
}

/*
https://github.com/KyleAMathews/deepmerge

The MIT License (MIT)

Copyright (c) 2012 Nicholas Fisher

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/


function emptyTarget(val) {
  return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
  var clone = !optionsArgument || optionsArgument.clone !== false;

  return (clone && isMergeableObject(value)) ?
    deepmerge(emptyTarget(value), value, optionsArgument) :
    value;
}

function defaultArrayMerge(target, source, optionsArgument) {
  return target.concat(source).map(function(element) {
    return cloneUnlessOtherwiseSpecified(element, optionsArgument);
  });
}

function mergeObject(target, source, optionsArgument) {
  var destination = {};
  if (isMergeableObject(target)) {
    Object.keys(target).forEach(function(key) {
      destination[key] = cloneUnlessOtherwiseSpecified(target[key], optionsArgument);
    });
  }
  Object.keys(source).forEach(function(key) {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneUnlessOtherwiseSpecified(source[key], optionsArgument);
    } else {
      destination[key] = deepmerge(target[key], source[key], optionsArgument);
    }
  });
  return destination;
}

function deepmerge(target, source, optionsArgument) {
  var sourceIsArray = Array.isArray(source);
  var targetIsArray = Array.isArray(target);
  var options = optionsArgument || {
    arrayMerge: defaultArrayMerge
  };
  var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

  if (!sourceAndTargetTypesMatch) {
    return cloneUnlessOtherwiseSpecified(source, optionsArgument);
  } else if (sourceIsArray) {
    var arrayMerge = options.arrayMerge || defaultArrayMerge;
    return arrayMerge(target, source, optionsArgument);
  } else {
    return mergeObject(target, source, optionsArgument);
  }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
  if (!Array.isArray(array)) {
    throw new Error('first argument should be an array');
  }

  return array.reduce(function(prev, next) {
    return deepmerge(prev, next, optionsArgument);
  }, {});
};


export default class notCommon {
  static MANAGER = null;
  static LOG = 'console';

  static deepMerge = deepmerge;

  static isError(e) {
    return (e instanceof Error) || (Object.prototype.hasOwnProperty.call(e, 'status') && e.status === 'error');
  }

  static TZ_OFFSET = (new Date().getTimezoneOffset() / 60) * -1;
  static DEV_ENV = 'production';
  static ENV_TYPE = window.NOT_ENV_TYPE ? window.NOT_ENV_TYPE : this.DEV_ENV;
  static NOOP = () => {};

  static mute() {
    this.ENV_TYPE = 'production';
  }

  static pad(n) {
    return n < 10 ? '0' + n : n;
  }

  //Проверка является ли переменная функцией.
  static isFunc(func) {
    return typeof(func) === 'function';
  }


  static isClass(fn){
     return /^\s*class/.test(fn.toString());
  }

  static detectType(testie){
    if (typeof testie !== 'function') {
    return typeof testie;
  } else {
    if (this.isClass(testie)) {
      return 'class';
    } else {
      return 'function';
    }
  }
  }

  //Проверка является ли переменная массивом
  static isArray(data) {
    return (typeof data == "object") && (data instanceof Array);
  }

  static localIsoDate(date) {
    date = date || new Date;
    let localIsoString = date.getFullYear() + '-' +
      this.pad(date.getMonth() + 1) + '-' +
      this.pad(date.getDate()) + 'T' +
      this.pad(date.getHours()) + ':' +
      this.pad(date.getMinutes()) + ':' +
      this.pad(date.getSeconds());
    return localIsoString;
  }

  static getToday() {
    let today = new Date;
    let date = today.getFullYear() + '-' + this.pad(today.getMonth() + 1) + '-' + this.pad(today.getDate());
    return date;
  }

  static logMsg() {
    let now = this.localIsoDate();
    // eslint-disable-next-line no-console
    window[this.LOG].log(`[${now}]: `, ...arguments);
  }

  static log(){
    this.logMsg(...arguments);
  }

  //Генерация метода вывода сообщений в консоль с указанием префикса.
  static genLogMsg(prefix) {
    return function(){
      let now = notCommon.localIsoDate();
      // eslint-disable-next-line no-console
      window[notCommon.LOG].log(`[${now}]: ${prefix}::`, ...arguments);
    };
  }

  /**
   * Определяет является ли окружение окружением разработки
   * @returns  {boolean} true если это запущено в окружении разработки
   **/
  static isDev() {
    return this.ENV_TYPE === this.DEV_ENV;
  }

  static debug(){
    if (this.isDev()) {
      return this.logMsg(...arguments);
    } else {
      return this.NOOP;
    }
  }

  static genLogDebug(prefix) {
    if (this.isDev()) {
      return this.genLogMsg(prefix);
    } else {
      return this.NOOP;
    }
  }

  static error(){
    this.logError(...arguments);
  }

  //Функция вывода сообщения об ошибке
  static logError() {
    let now = this.localIsoDate();
    // eslint-disable-next-line no-console
    window[this.LOG].error(`[${now}]: `, ...arguments);
  }

  static genLogError(prefix) {
    return function(){
      let now = notCommon.localIsoDate();
      // eslint-disable-next-line no-console
      window[notCommon.LOG].error(`[${now}]: ${prefix}::`, ...arguments);
    };
  }

  static report(e) {
    if (this.getApp() && this.getApp().getOptions('services.notErrorReporter')) {
      let reporter = this.getApp().getOptions('services.notErrorReporter');
      if (reporter && reporter.report) {
        reporter.report(e).catch(this.error.bind(this));
      }
    } else {
      if (!this.get('production')) {
        this.error(...arguments);
      }
    }
  }

  static trace() {
    if (!this.get('production')) {
      this.trace(...arguments);
    }
  }

  static trimBackslash(str){
    if(str.indexOf('/') === 0){
      str = str.substring(1);
    }
    if(str[str.length - 1] === '/'){
      str = str.substring(0, str.length - 1);
    }
    return str;
  }

  /**
  *  Builds URL with structure like prefix/module/model/id/action
  * If some part absent or set to false it will be excluded from result
  *
  *  @return {string}  url path
  */
  static buildURL({  prefix, module, model, id, action  }){
    let url = ['/'];
    if(prefix)  {  url.push(encodeURIComponent(this.trimBackslash(prefix)));}
    if(module)  { url.push(encodeURIComponent(this.trimBackslash(module)));}
    if(model)    { url.push(encodeURIComponent(this.trimBackslash(model)));}
    if(id)      { url.push(encodeURIComponent(this.trimBackslash(id)));      }
    if(action)  { url.push(encodeURIComponent(this.trimBackslash(action)));  }
    url = url.filter(el => el !== '' );
    return url.join('/').replace(/\/\//g, '/');
  }


  static capitalizeFirstLetter(name) {
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  static lowerFirstLetter(string) {
    return string.charAt(0).toLowerCase() + string.slice(1);
  }

  static escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  static startApp(starter) {
    document.addEventListener('DOMContentLoaded', starter);
  }

  static getApp() {
    return this.get('app');
  }

  static extendAppConfig(conf, conf2) {
    return this.deepMerge(conf, conf2);
  }

  static absorbModule(defaultConf, mod, services = {}, uis = {}) {
    for (let prop in mod) {
      //add manifest to other
      switch (prop) {
      case 'manifest':
        defaultConf = this.extendAppConfig(defaultConf, mod.manifest);
        break;
      case 'services':
        if (services){
          for(let serv in mod[prop]){
            services[serv] = mod[prop][serv];
          }
        }
        break;
      case 'uis':
        if (uis){
          for(let ui in mod[prop]){
            if(Object.prototype.hasOwnProperty.call(uis, ui)){
              this.logError(`uis property duplication ${ui}`);
            }
            uis[ui] = mod[prop][ui];
          }
        }
        break;
      default:
        if(prop.indexOf('nc')===0){
          if(!Object.prototype.hasOwnProperty.call(defaultConf, 'controllers')){
            defaultConf.controllers = {};
          }
          defaultConf.controllers[prop] = mod[prop];
        }else{
          //in case of some other stuff presented, isolating it in special var
          if(!Object.prototype.hasOwnProperty.call(window, 'notEnv')){
            window.notEnv = {};
          }
          window.notEnv[prop] = mod[prop];
        }
      }
    }
    return defaultConf;
  }

  static defineIfNotExists(obj, key, defaultValue) {
    if (!Object.prototype.hasOwnProperty.call(obj, key)) {
      obj[key] = defaultValue;
    }
  }

  static registry = {};

  static register(key, val) {
    this.registry[key] = val;
  }

  static get(key) {
    return Object.prototype.hasOwnProperty.call(this.registry, key) ? this.registry[key] : null;
  }

  static moveItem(array, old_index, new_index) {
    if (new_index >= array.length) {
      var k = new_index - array.length;
      while ((k--) + 1) {
        array.push(undefined);
      }
    }
    array.splice(new_index, 0, array.splice(old_index, 1)[0]);
  }

  static stripProxy(obj) {
    if (typeof obj !== 'undefined' && obj !== null) {
      if (obj.isProxy) {
        if (Array.isArray(obj)) {
          obj = Array.from(obj);
        } else {
          obj = Object.assign({}, obj);
        }
        for (let t in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, t)) {
            obj[t] = this.stripProxy(obj[t]);
          }
        }
      }
    }
    return obj;
  }

  static pipe(data /* feed data */ , funcs /* functions array */ ) {
    let result;
    for (let func of funcs) {
      result = func(result || data);
    }
    return result;
  }

  static getAPI(type) {
    return this.getManager() ? this.getManager().getAPI(type) : null;
  }

  static setManager(v) {
    this.MANAGER = v;
  }

  static getManager() {
    return this.MANAGER;
  }

  static getJSON(url){
    return fetch(url).then(response => response.json());
  }

  static wait(sec){
    return new Promise((res)=>{
      setTimeout(res, sec * 1000);
    });
  }

  static registerWidgetEvents(events){
    if(this.getApp()){
      Object.keys(events).forEach(eventName => {
        this.getApp().on(eventName, events[eventName]);
      });
    }
  }

}
