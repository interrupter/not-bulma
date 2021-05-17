import {writable} from 'svelte/store';

const store = writable({});

const OPTS = {
  default: 'en',
  getter: null
};

class Locale{
  static dict;

  static say(phrase, params = [], locale = OPTS.default){
    try{
      let tmpl = store[locale][phrase],
        result = '';
      if (params){
        if(Array.isArray(params)){
          result = format(tmpl, ...params);
        }else{
          result = format(tmpl, params);
        }
      }else{
        result = tmpl;
      }
      return result;
    }catch(e){
      //!TODO replace on not-error/not-error-report
      //console.error(e);
    }
  }

  static set(dict){
    store.update( () => dict );
  }

  static vocabulary(){
    return store;
  }

  static OPTS(){
    return Object.assign({}, OPTS);
  }
}

store.subscribe((dict)=>{
  Locale.dict = dict;
});

export default Locale;
