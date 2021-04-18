import {
  writable
} from 'svelte/store';

const ALL = {};

function exist(key) {
  return Object.prototype.hasOwnProperty.call(ALL, key);
}

function get(key) {
  if (exist(key)) {
    return ALL[key];
  } else {
    return false;
  }
}

function create(key, props = {
  'raw': [],
  'filtered': [],
  'selected': {}
}) {
  if (!exist(key)) {
    if (Object.keys(props).length > 0) {
      ALL[key] = {};
      Object.keys(props).forEach((name) => {
        ALL[key][name] = writable(props[name]);
      });
    } else {
      throw new Error('store\'s props wasn\'t specified');
    }
  }
  return ALL[key];
}

/**
 * Creates object that is fake Store
 * Some time this is useful when you need to initialize local var,
 * before you could get actual Stores from central storage by its ID
 *	@params {mixed} val 	data of type that is actual storage will contain
 * @returns {Object}
 */

function fake(val) {
  return {
    subscribe(f) {
      f(val);
      return () => {};
    },
    set() {}
  };
}

export {
  create,
  get,
  fake
};
