class LIB{
	constructor(){
		this.lib = {};
	}

	/**
  *
  * @params {string}  mode what to do if element exists [replace|add|skip]
  */
	add(name, comp, mode = 'replace'){
		if(this.contain(name)){
			if(mode === 'replace'){
				this.lib[name] = comp;
			}else if(mode === 'add'){
				this.lib[name] = Object.assign(this.lib[name], comp);
			}
		}else{
			this.lib[name] = comp;
		}
	}

	get(name){
		return this.lib[name];
	}

	contain(name){
		return Object.prototype.hasOwnProperty.call(this.lib, name);
	}

	import(bulk){
		for(let f in bulk){
			FIELDS.add(f, bulk[f]);
		}
	}
}

const FIELDS = new LIB();
const COMPONENTS = new LIB();
const VARIANTS = new LIB();

export {
	FIELDS,
	COMPONENTS,
	VARIANTS
};
