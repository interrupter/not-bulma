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

function create(key, props = {'raw': [], 'filtered': []}) {
	if (!exist(key)) {
		if(Object.keys(props).length > 0){
			ALL[key] = {};
			Object.keys(props).forEach((name) => {
				ALL[key][name] = writable(props[name]);
			});
		}else{
			throw new Error('store\'s props wasn\'t specified');
		}
	}
	return ALL[key];
}

export {
	create,
	get
};
