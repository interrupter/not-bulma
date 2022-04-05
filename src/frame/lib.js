class Lib{
  #lib = {};

  constructor(){}

  /**
  *
  * @params {string}  mode what to do if element exists [replace|add|skip]
  */
  add(name, comp, mode = 'replace'){
    if(this.contains(name)){
      if(mode === 'replace'){
        this.#lib[name] = comp;
      }else if(mode === 'add'){
        this.#lib[name] = Object.assign(this.#lib[name], comp);
      }
    }else{
      this.#lib[name] = comp;
    }
  }

  get(name){
    return this.#lib[name];
  }

  contains(name){
    return Object.prototype.hasOwnProperty.call(this.#lib, name);
  }

  import(bulk, mode = 'replace'){
    for(let f in bulk){
      this.add(f, bulk[f], mode);
    }
  }

  isEmpty(){
    return Object.keys(this.#lib).length === 0;
  }
}

export default Lib;
