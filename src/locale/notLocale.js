/**
* Purpose of this Locale object is that it will hold library of localization
* templates and provide basic localization service to other modules
**/

import EventEmitter from 'wolfy87-eventemitter';

import {notCommon,notPath} from '../frame';

import LOCALE from './store';

class notLocale extends EventEmitter{
  constructor(){
    super();
    this.dict = {};          //dictionary of phrases
    this.helpers = {};        //additional helper functions and constants
    let dict = this.restoreFromStorage();
    if(dict){
      this.set(dict);
    }
  }

  /**
  * String format should comply notPath standart.
  * {path_to_access} - is
  * : - is used to access to params
  * :: - is used to access to helpers
  * Welcome, {:where}! - will replace {:where} with content of params.where
  * Welcome, {::where}! - will replace {:where} with content of this.helpers.where
  * () - after path is to invoke function of target object
  * Welcome, {::where()}! - will try to exec this.helpers.where(params, undefined)
  * @param    {string}  str         localized string template with mark to include data
  * @param    {object}  params      params to use in string
  * @returns  {string}              localized version of string with
  */
  format(str, params){
    return notPath.parseSubs(str, params, this.helpers);
  }

  /**
  * Return localized version of string with injected data from provided object
  * may also use Locale.helpers as source of data
  * @param {string}   phrase    name of string to localize
  * @param {object}   params    object with data to inject in phrase template
  * @return {string}            localized string with injected data
  */
  say(phrase, params = false){
    try{
      if(Object.prototype.hasOwnProperty.call(this.dict, phrase)){
        let tmpl = this.dict[phrase],
          result = '';
        if (params){
          result = this.format(tmpl, params);
        }else{
          result = tmpl;
        }
        return result;
      }else{
        throw new Error(`Unknown locale phrase: ${phrase}`);
      }
    }catch(e){
      notCommon.debug(e);
      return phrase;
    }
  }

  /**
  * Setting new dictionary. triggers event 'change'
  * @param {object}     dict      vocabulary of phrases and templates
  **/
  set(dict){
    LOCALE.set(dict);
    this.saveToStorage(dict);
    this.dict = Object.assign({}, {...dict});
    this.emit('change');
  }


  saveToStorage(dict){
    if (window.localStorage) {
    	try {
    	  return window.localStorage.setItem('dictionary', JSON.stringify(dict));
      } catch (e) {
        notCommon.debug(e);
        return false;
      }
    }
    return false;
  }

  restoreFromStorage(){
    if (window.localStorage) {
    	try {
    	  let str =  window.localStorage.getItem('dictionary');
        if(str){
          let dict = JSON.parse(str);
          return dict;
        }else{
          return false;
        }
      } catch (e) {
        notCommon.debug(e);
        return false;
      }
    }
    return false;
  }

  /**
  * Returns writable store of phrases
  * @return {object}  writable store
  */
  vocabulary(){
    return LOCALE;
  }
}



export default new notLocale();
