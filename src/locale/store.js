import { writable } from 'svelte/store';

function initDict(target = {}){
  const handler = {
    get: function (target, prop) {
      if (!Object.prototype.hasOwnProperty.call(target, prop)) {
        return prop;
      }
      return Reflect.get(...arguments);
    },
  };
  return new Proxy(target, handler);
}

function createLocale() {
  const { subscribe, set, update } = writable(initDict());
  return {
    subscribe,
    update,
    set: (val)=>{
      set(initDict(val));
    },
    reset: () => set(initDict())
  };
}

const LOCALE = createLocale();

export default LOCALE;
