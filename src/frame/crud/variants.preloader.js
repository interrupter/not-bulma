import notCommon from "../common";

const PRELOADABLE = ["create", "update", "list", "delete", "details"];

const returnIfOptionExists = (options, optionName, defaultValue)=>{
    if (typeof options === 'object') {
        if (Object.hasOwn(options, optionName)){
            return options[optionName];
        }
    }
    return defaultValue;
}

export default class CRUDVariantsPreloader {

    static getFilter(controller, options){
        return returnIfOptionExists(options, 'filter', {});
    }
    
    static getSorter(controller, options){
        return returnIfOptionExists(options, 'sorter', {});
    }

    static getPager(controller, options){
        return returnIfOptionExists(options, 'pager', {});
    }

    static getMethod(controller, options){
        return returnIfOptionExists(options, 'method', 'listAll');
    }

    static getModelName(controller, options){
        if(typeof options === 'string'){
            return notCommon.lowerFirstLetter(options);
        }else if (typeof options === 'object'){
            return notCommon.lowerFirstLetter(returnIfOptionExists(options, 'modelName'));
        }
        throw new Error('Controller Action Preload Option\'s model is not defined');        
    }

    static getIdField(controller, options){
        return returnIfOptionExists(options, 'idField', 'id');
    }

    static getTitleField(controller, options){
        return returnIfOptionExists(options, 'titleField', 'title');
    }

    static setVariants(controller, type, variantsName, variants){
        controller.setOptions(
            `variants.${type}.${variantsName}`,
            variants
        );
    }

    static getActionsPreloads(controller, type){
        return controller.getOptions(`${type}.preload`, {});
    }

    static getControllersPreloads(controller){
        return controller.getOptions(`preload`, {});
    }

    static getPreloads(controller, type){
        let requestedPreloads = this.getActionsPreloads(controller, type);
        if (Object.keys(requestedPreloads).length == 0) {
            requestedPreloads = this.getControllersPreloads(controller);
        }
        return requestedPreloads;
    }

    static preloadRestricted(controller, type){
        const preloadables = controller.getOptions('preloadable', PRELOADABLE);
        return preloadables.includes(type);
    }

    static addPreloadRequest(controller, requestedPreloads, requestsList){
        return (prop)=>{
            const modelName = this.getModelName(controller, requestedPreloads[prop]);
            const Model = controller.make[modelName]({});
            const actionMethod = this.getMethod(controller, requestedPreloads[prop]);
            requestsList.push(Model[`$${actionMethod}`]());
        }
    }

    static async loadAll(controller, requestedPreloads){        
        const requestsList = [];        
        Object.keys(requestedPreloads).forEach(this.addPreloadRequest(controller, requestedPreloads, requestsList));
        return await Promise.all(requestsList);
    }

    static getPreloadOptions(controller, preloadsOptions, preloadName){
        return preloadsOptions[preloadName];
    }   

    static getListItemTransformer(controller, preloadOptions){
        const func = this.getCustomListItemTransformer(controller, preloadOptions);
        if(typeof func === 'function'){
            return func(controller, preloadOptions);
        }else{
            return this.getDefaultTransformer(controller, preloadOptions);
        }
    }
   

    static getCustomListItemTransformer(controller, preloadOptions){
        return returnIfOptionExists(preloadOptions, 'itemTransformer');
    }


    static getDefaultTransformer(controller, options){
        return (item)=>{ 
            return {
                id: item[this.getIdField(controller, options)],
                title: item[this.getTitleField(controller, options)],
            };
        }
    }

    static transformAndAddToLibResults(controller, type, preloadName, preloadOptions, results){  
        const listItemTransformer = this.getListItemTransformer(controller, preloadOptions);      
        const variants = results.map(listItemTransformer);
        this.setVariants(controller, type, preloadName, variants);
    }

    static resultIsNotEmpty(requestResult){
        return requestResult.status === "ok" && Array.isArray(requestResult.result);
    }

    static async preload(controller, type = "list") {
        try {            
            if (!this.preloadRestricted(controller, type)) {
                return;
            }
            const requestedPreloads = this.getPreloads(controller, type);            
            if (Object.keys(requestedPreloads).length === 0) {
                return;
            }
            const results = await this.loadAll(controller, requestedPreloads);
           
            Object.keys(requestedPreloads).forEach((preloadName, index)=>{
                const preloadOptions = requestedPreloads[preloadName];                
                if (this.resultIsNotEmpty(results[index])) {                    
                    this.transformAndAddToLibResults(controller, type,preloadName, preloadOptions, results[index].result);
                }                
            });
            controller.log("preload finished");
        } catch (e) {
            controller.report(e);
            controller.showErrorMessage(e);
        }
    }
}
