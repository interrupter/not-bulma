import {mount, unmount} from 'svelte';

export default class UIAdapterSvelte {
    #props = $state({});
    #instance;
    #uiConstructor;
    #replaceTarget = false;
    #initialTarget;

    /**
     *
     *
     * @param {function} svelteUI               svelte component function
     * @param {HTMLElement} target              target element of DOM
     * @param {object} [uiProps = {}]           props of svelte component     
     * @param {boolean} [replaceTarget=false]   if component should replace target DOM element
     * @param {boolean} [manualRender=false]    if you want to call render function later
     * @memberof UIAdapterSvelte
     */
    constructor(svelteUI, target, uiProps = {}, replaceTarget = false, manualRender = false){
        this.#uiConstructor = svelteUI;
        this.#initialTarget = target;
        if (typeof uiProps === 'object') {
            this.#props = uiProps;
        }
        this.#replaceTarget = replaceTarget;
        if (!manualRender){
            this.render(target);
        }
    }

    render(target){
        const currentTarget = target || this.#initialTarget;
        if (this.#replaceTarget && target){
            const frag = document.createDocumentFragment();
            this.#instance = mount(this.#uiConstructor, {
                target: frag,
                props: this.#props,
            });
            currentTarget.replaceWith(frag);
        }else{
            this.#instance = mount(this.#uiConstructor, {target:currentTarget, props: this.#props});
        }    
    }    

    $on(eventName, callback){
        return this.on(eventName, callback);
    }

    on(eventName, callback){
        this.#props[eventName] = callback;
        return this;
    }

    $off(eventName){
        return this.off(eventName);
    }

    off(eventName){
        delete this.#props[eventName];
        return this;
    }

    $set(propKey, value){
        return this.set(propKey, value);
    }

    set(propKey, value){
        this.#props[propKey] = value;
        return this;
    }

    $get(propKey){
        return this.get(propKey);
    }

    get(propKey){
        return this.#props[propKey];
    }

    get props(){
        return this.#props;
    }

    $destroy(){
        return this.destroy();
    }

    destroy(){
        unmount(this.#instance);    
        this.#instance = undefined;
        this.#props = undefined;
        this.#uiConstructor = undefined;
        return this;
    }

    exec(what, params = []){
        if(this.#instance && what && this.#instance[what]){
            return this.#instance[what](...params);
        }else{
            return undefined;
        }
    }
}