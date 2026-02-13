import EventEmitter from "wolfy87-eventemitter";
import notPath from "not-path";
import notCommon from "not-bulma/src/frame/common.js";



import UITable from "not-bulma/src/frame/components/table/notTable.svelte";
import UIAdapterSvelte from "not-bulma/src/frame/ui.adapter.svelte.js";

const CONST_ID_DUBLICATE_POSTFIX = "__dublicate__";

const OPT_DEFAULT_PAGE_SIZE = 20,
    OPT_DEFAULT_PAGE_NUMBER = 0,
    OPT_DEFAULT_PAGE_RANGE = 6,
    OPT_DEFAULT_SORT_DIRECTION = 1,
    OPT_DEFAULT_SEARCH = "",
    OPT_DEFAULT_RETURN = {},
    OPT_DEFAULT_COMBINED = false,
    OPT_DEFAULT_COMBINED_ACTION = "listAndCount",
    OPT_DEFAULT_COUNT_ACTION = "count",
    OPT_DEFAULT_LIST_ACTION = "list",
    OPT_DEFAULT_SORT_FIELD = "_id",
    OPT_FIELD_NAME_PRE_PROC = "preprocessor";

const DEFAULT_OPTIONS = {
    ui: UITable,
    links: [],
    actions: [],
    endless: false,
    idField: "_id",
    getItemId: (item) => {
        return item._id;
    },
};

function defaultState(){
    return {
        pager:{

        },
        pagination: {
            items: {
                count: 0,
                from: 0,
                to: 0,
            },
            pages: {
                count: 0,
                from: 0,
                to: 0,
                current: 0,
                list: [],
            },
        },
    };
}

function defaultStores(){
    return {
        raw: [],
        filtered: [],
        refined: [],
        selected: {},
        state: defaultState(),
        working: {},
    };
}


class notTable extends EventEmitter {

    #stores = defaultStores();

    #data = {
        raw: [],
        filtered: [],
        refined: [],
        selected: {},
        working: {}
    }; 

    #ui = {};

    constructor(input = {}) {
        super();
        this.id = "table-" + Math.random();
        this.options = {
            ...DEFAULT_OPTIONS,
            ...(input.options ? input.options : {}),
        };
        
     
        if (notCommon.objHas(input, "data") && Array.isArray(input.data)) {
            this.setStoreContent('raw', input.data);
        }

        this.setCombinedActionName(
            this.getOptions(
                "interface.combinedAction",
                OPT_DEFAULT_COMBINED_ACTION
            )
        );

        if (notCommon.objHas(this.options, "filter")) {
            this.setFilter(this.options.filter, true);
        } else {
            this.resetFilter();
        }
        if (notCommon.objHas(this.options, "pager")) {
            this.setPager(this.options.pager, true);
        } else {
            this.resetPager();
        }
        if (notCommon.objHas(this.options, "sorter")) {
            this.setSorter(this.options.sorter, true);
        } else {
            this.resetSorter(true);
        }
        if (notCommon.objHas(this.options, "return")) {
            this.setReturn(this.options.return);
        } else {
            this.setReturn();
        }
        if (notCommon.objHas(this.options, "search")) {
            this.setSearch(this.options.search, true);
        } else {
            this.setSearch();
        }

        this.on('onStateUpdate', this.onStateUpdate.bind(this));
        this.render();
        this.updateData();
        return this;
    }

    setStoreContent(storeName, value){
        this.#stores[storeName] = value;
        this.callStoreUpdateEvent(storeName, value);
    }


    updateStore(storeName, valueHandler){        
        this.#stores[storeName] = valueHandler(this.#stores[storeName]);
        this.callStoreUpdateEvent(storeName, this.#stores[storeName]);
    }

    callStoreUpdateEvent(storeName, value){
        const StoreName =notCommon.capitalizeFirstLetter(storeName);
        const EventHandlerName = `on${StoreName}Update`;
        if(this[EventHandlerName]){
            this[EventHandlerName](value);
        }
    }

    onWorkingUpdate(val) {
        this.#data.working = val;
        return val;
    }

    onRawUpdate(val) {
        this.#data.raw = val;
        return val;
    }

    onFilteredUpdate(val) {
        this.#data.filtered = val;
        this.refineFiltered();
        return val;
    }

    onRefinedUpdate(val) {
        this.#data.refined = val;
        this.clearSelected();
        if (this.#ui && this.#ui.table){
            this.#ui.table.set('items', this.#data.refined);
        }
        return val;
    }    

    onSearchChange(line) {
        if (line.length > 3) {
            this.setSearch(line);
        } else {
            this.setSearch();
        }
    }

    onSorterChange(sorter) {
        if (sorter) {
            this.setSorter(sorter);
        } else {
            this.resetSorter();
        }
    }

    onFilterChange({ filter, actionName }) {
        if (actionName.indexOf(OPT_DEFAULT_COMBINED_ACTION) === 0) {
            this.setCombinedActionName(actionName);
        }
        if (filter) {
            this.setFilter(filter);
        } else {
            this.resetFilter();
        }
    }

    onSelectedUpdate(val) {
        this.#data.selected = val;
    }

    clearSelected() {
        this.#data.selected = {};
    }

    getSelected(object = false, store = "refined") {
        const res = [];
        for (let id in this.#data.selected) {
            if (this.#data.selected[id]) {
                if (object) {
                    const indx = this.#data[store].findIndex(
                        (item) => item._id === id
                    );
                    if (indx > -1) {
                        res.push(this.#data[store][indx]);
                    }
                } else {
                    res.push(id);
                }
            }
        }
        return res;
    }

    getItemId(item) {
        return this.getOptions("getItemId", DEFAULT_OPTIONS.getItemId)(item);
    }

    selectAll() {                
        this.#data.filtered.forEach((item) => {
            this.#ui.table.set(`selected.${this.getItemId(item)}`, true);
        });        
    }

    selectNone() {
        this.#data.filtered.forEach((item) => {
            this.#ui.table.set(`selected.${this.getItemId(item)}`, false);
        });
    }

    render() {
        if (!this.#ui.table) {
            this.#ui.table = new UIAdapterSvelte(
                this.options.ui,
                this.options.targetEl,
                {
                    id: this.id,
                    filterUI: this.getOptions("filterUI", undefined),                    
                    helpers: Object.assign({}, this.getHelpers()),
                    fields: this.getOptions("fields"),
                    
                    actions: this.getActions(),
                    links: this.getLinks(),
                    search: "",

                    showSelect: this.getOptions("showSelect"),
                    showSearch: this.getOptions("showSearch"),
                    showSort: this.getOptions("showSort"),
                    idField: this.getOptions("idField"),
                    getItemId: this.getOptions("getItemId"),
                    filter: this.getFilter(),
                    
                    items: this.#stores.refined,
                    selected: this.#stores.selected,

                    state: this.#stores.state

                }
            );            
        }
        
        this.#ui.table.$on("onSearchChange", (e) => this.onSearchChange(e));
        this.#ui.table.$on("onSorterChange", (e) => this.onSorterChange(e));
        this.#ui.table.$on("onFilterChange", (e) => this.onFilterChange(e));
        this.#ui.table.$on("onGoToPage", (e) => this.goToPage(e));
        this.#ui.table.$on("onGoToNextPage", () => this.goToNext());
        this.#ui.table.$on("onGoToPrevPage", () => this.goToPrev());
    }

    getActions() {
        return this.getOptions("actions", []);
    }

    getLinks() {
        return this.getOptions("links", []);
    }

    getHelpers() {
        return this.options.helpers || {};
    }

    setWorking(key, value) {
        notPath.set(key, this.#stores.working, this.getHelpers(), value);
        this.onWorkingUpdate(this.#stores.working);            
        return this;
    }

    getWorking(key, def) {
        let res = notPath.get(key, this.#stores.working, this.getHelpers());
        if (res === undefined) {
            return def;
        } else {
            return res;
        }
    }

    onStateUpdate(){
        if(this.#ui.table){
            this.#ui.table.set(':state', this.#stores.state);
        }
    }

    setState(key, value) {
        notPath.set(key, this.#stores.state, this.getHelpers(), value);
        this.emit('onStateUpdate');
        return this;
    }

    getState(key, def) {
        let res = notPath.get(`:${key}`,  this.#stores.state);
        if (res === undefined) {
            return def;
        } else {
            return res;
        }
    }

    updateState(updater){
        this.#stores.state = updater(this.#stores.state);
        this.emit('onStateUpdate');
        return this;
    }

    updateStateProp(key, updater){
        notPath.set(key, this.#stores.state, this.getHelpers(), updater(notPath.get(key,  this.#stores.state)));        
        this.emit('onStateUpdate');
        return this;
    }

    setOptions(key, value) {
        notPath.set(key, this.options, this.getHelpers(), value);
        return this;
    }

    getOptions(key, def) {
        let res = notPath.get(key, this.options, this.getHelpers());
        if (res === undefined) {
            return def;
        } else {
            return res;
        }
    }

    setFilter(hash, withoutInvalidation = false) {
        this.setState("filter", hash);
        if (withoutInvalidation) {
            return this;
        }
        this.invalidateData();
        this.updateData();
        return this;
    }

    resetFilter() {
        this.setState("filter", {});
        return this;
    }

    getFilter() {
        return this.getState("filter");
    }

    setPager(hash, withoutInvalidation = false) {
        this.setState("pager", hash);
        if (withoutInvalidation) {
            return this;
        }
        this.updateData();
        return this;
    }

    getDefaultPageNumber() {
        return isNaN(this.getOptions("pager.page"))
            ? OPT_DEFAULT_PAGE_NUMBER
            : this.getOptions("pager.page");
    }

    getDefaultPageSize() {
        return isNaN(this.getOptions("pager.size"))
            ? OPT_DEFAULT_PAGE_SIZE
            : this.getOptions("pager.size");
    }

    resetPager() {
        this.setState("pager", {
            size: this.getDefaultPageSize(),
            page: this.getDefaultPageNumber(),
        });
    }

    getPager() {        
        return this.getState("pager");
    }

    setSorter(hash, withoutInvalidation = false) {
        this.setWorking("sorter", hash);
        if (withoutInvalidation) {
            return this;
        }
        this.invalidateData();
        this.updateData();
        return this;
    }

    resetSorter(withoutInvalidation = false) {
        let t = {};
        t[OPT_DEFAULT_SORT_FIELD] = OPT_DEFAULT_SORT_DIRECTION;
        return this.setSorter(t, withoutInvalidation);
    }

    getSorter() {
        return this.getWorking("sorter");
    }

    getSorterDirection() {
        try {
            let names = Object.keys(this.getSorter());
            return this.getSorter()[names[0]];
        } catch (e) {
            return OPT_DEFAULT_SORT_DIRECTION;
        }
    }

    getSearch() {
        let search =
            typeof this.getWorking("search") !== "undefined" &&
            this.getWorking("search") !== null;
        return search ? this.getWorking("search") : "";
    }

    setSearch(line = OPT_DEFAULT_SEARCH, withoutInvalidation = false) {
        this.setWorking("search", line);
        if (withoutInvalidation) {
            return this;
        }
        this.invalidateData();
        this.updateData();
        return this;
    }

    getReturn() {
        return this.getWorking("return");
    }

    setReturn(ret = OPT_DEFAULT_RETURN) {
        this.setWorking("return", ret);
        return this;
    }

    clearFilteredData() {
        this.setStoreContent('filtered', []);
    }

    clearRawData() {
        this.setStoreContent('raw', []);
    }

    clearRefinedData() {
        this.setStoreContent('refined', []);
    }

    invalidateData() {
        //clearing filtered and sorted
        this.clearFilteredData();
        //in case live loading from server
        if (this.isLive()) {
            //clearing loaded data
            this.clearRawData();
        }
        //resset pager anyway
        this.resetPager();
    }

    isLive() {
        return (
            this.getOptions("interface") && this.getOptions("interface.factory")
        );
    }

    setUpdating() {
        this.setState("updating", true);
    }

    setUpdated() {
        this.setState("updating", false);
    }

    ifUpdating() {
        return this.getState("updating");
    }

    getDataInterface() {
        let factory = this.getOptions("interface.factory");
        if (typeof factory === "function") {
            return factory({});
        } else {
            return factory;
        }
    }

    getLoadDataActionName() {
        return this.getOptions("interface.listAction")
            ? this.getOptions("interface.listAction")
            : OPT_DEFAULT_LIST_ACTION;
    }

    setCombinedActionName(actionName = OPT_DEFAULT_COUNT_ACTION) {
        this.setWorking("interface.combinedAction", actionName);
    }

    getCombinedActionName() {
        return this.getWorking("interface.combinedAction")
            ? this.getWorking("interface.combinedAction")
            : OPT_DEFAULT_COMBINED_ACTION;
    }

    getCountActionName() {
        return this.getOptions("interface.countAction")
            ? this.getOptions("interface.countAction")
            : OPT_DEFAULT_COUNT_ACTION;
    }

    loadData() {
        //load from server
        let query = this.getDataInterface()
                .setFilter(this.getFilter())
                .setSorter(this.getSorter())
                .setReturn(this.getReturn())
                .setSearch(this.getSearch())
                .setPager(this.getPager()),
            actionName;
        if (this.getOptions("interface.combined", OPT_DEFAULT_COMBINED)) {
            actionName = this.getCombinedActionName();
        } else {
            actionName = this.getLoadDataActionName();
        }
        return query["$" + actionName]();
    }

    goToNext() {
        let next = isNaN(this.getState("pager.page"))
            ? this.getDefaultPageNumber()
            : this.getState("pager.page") + 1;
        this.setState(
            "pager.page",
            Math.min(next, this.getState("pagination.pages.to"))
        );
        this.updateData();
    }

    goToPrev() {
        let prev = isNaN(this.getState("pager.page"))
            ? this.getDefaultPageNumber()
            : this.getState("pager.page") - 1;
        this.setState(
            "pager.page",
            Math.max(prev, this.getState("pagination.pages.from"))
        );
        this.updateData();
    }

    goToFirst() {
        this.setState("pager.page", this.getState("pagination.pages.from"));
        this.updateData();
    }

    goToLast() {
        this.setState("pager.page", this.getState("pagination.pages.to"));
        this.updateData();
    }

    goToPage(pageNumber) {
        this.setState("pager.page", pageNumber);
        this.updateData();
    }

    testDataItem(item) {
        let strValue = this.getSearch().toLowerCase();
        for (let k in item) {
            let toComp = item[k].toString().toLowerCase();
            if (toComp.indexOf(strValue) > -1) {
                return true;
            }
        }
        return false;
    }

    getRowsCount() {
        let query = this.getDataInterface().setFilter(this.getFilter());
        return query["$" + this.getCountActionName()]()
            .then((data) => {
                this.updatePagination(data.count);
            })
            .catch((e) => {
                this.error(e);
            });
    }

    updatePagination(itemsCount) {
        this.log("update pagination", itemsCount);
        this.updateStateProp('pagination.pages.list', (listVal)=>{
            listVal.splice(0, listVal.length);
            return listVal;
        });   
        let itemsFrom =
                (this.getPager().page - OPT_DEFAULT_PAGE_NUMBER) *
                    this.getPager().size +
                1,
            pagesCount =
                itemsCount % this.getPager().size
                    ? Math.floor(itemsCount / this.getPager().size) + 1
                    : Math.round(itemsCount / this.getPager().size),
            pagesFrom = Math.max(
                OPT_DEFAULT_PAGE_NUMBER,
                this.getPager().page - OPT_DEFAULT_PAGE_RANGE
            ),
            pagesTo = Math.min(
                pagesCount - (1 - OPT_DEFAULT_PAGE_NUMBER),
                this.getPager().page + OPT_DEFAULT_PAGE_RANGE
            ),
            list = [],
            itemsTo = Math.min(
                itemsFrom + this.getPager().size - 1,
                itemsCount
            );
        for (let t = pagesFrom; t <= pagesTo; t++) {
            list.push({
                index: t,
                active: t === this.getPager().page,
            });
        }

        this.log("update pagination", this.getState(':'));
        this.setState('count', itemsCount);
        this.setState('pagination.items.from', itemsFrom);
        this.setState('pagination.items.to',itemsTo);
        this.setState('pagination.pages.count',pagesCount);        
        this.setState('pagination.pages.from',pagesFrom);        
        this.setState('pagination.pages.to',pagesTo);        
        this.setState('pagination.pages.current', this.getPager().page);        
        this.updateStateProp('pagination.pages.list', (listVal)=>{
            listVal.splice(0, listVal.length, ...list );
            return listVal;
        });        
    }

    updateData() {
        if (this.isLive()) {
            if (this.ifUpdating()) {
                return;
            }
            if (!this.getOptions("endless", false)) {
                this.clearRawData();
            }
            this.setUpdating();
            if (this.getOptions("interface.combined", OPT_DEFAULT_COMBINED)) {
                this.loadData()
                    .then((data) => {
                        const full =
                            notCommon.objHas(data, "status") &&
                            notCommon.objHas(data, "result");
                        this.updateStore('filtered', (val) => {
                            if (!this.getOptions("endless", false)) {
                                this.clearFilteredData();
                            }
                            if (full && data?.result.list) {
                                val.push(...(data.result.list || []));
                            } else {
                                if (
                                    notCommon.objHas(data, "list") &&
                                    Array.isArray(data.list)
                                ) {
                                    val.push(...data.list);
                                } else if (Array.isArray(data)) {
                                    val.push(...data);
                                }
                            }
                            return val;
                        });
                        this.setWorking(
                            "lastCount",
                            full ? data.result.count : data.count
                        );
                    })
                    .then(() => {
                        this.updatePagination(this.getWorking("lastCount"));
                    })
                    .catch(this.error.bind(this))
                    .then(this.setUpdated.bind(this));
            } else {
                this.loadData()
                    .then((data) => {
                        this.updateStore('filtered', (val) => {
                            val.push(...data);
                            return val;
                        });                        
                    })
                    .then(this.getRowsCount.bind(this))
                    .catch(this.error.bind(this))
                    .then(this.setUpdated.bind(this));
            }
        } else {
            //local magic
            this.setUpdating();
            this.processData();
            this.setUpdated();
        }
    }

    getData() {
        return this.data;
    }

    processData() {
        let thatFilter = this.getFilter();
        //this.getData('rows').__setPassive;
        this.log(this.getData());
        if (
            typeof thatFilter !== "undefined" &&
            thatFilter !== null &&
            typeof thatFilter.filterSearch !== "undefined" &&
            thatFilter.filterSearch !== null &&
            thatFilter.filterSearch.length > 0
        ) {
            this.updateStore('filtered', (val) => {
                val.splice(
                    0,
                    val.length,
                    ...this.#data.raw.filter(this.testDataItem.bind(this))
                );
                return val;
            });
        } else {
            this.updateStore('filtered',(val) => {
                val.splice(0, val.length, ...this.#data.raw);
                return val;
            });
        }
        ////sorter
        let thatSorter = this.getSorter();
        if (typeof thatSorter !== "undefined" && thatSorter !== null) {
            this.updateStore('filtered', (val) => {
                val.sort((item1, item2) => {
                    let t1 = notPath.get(thatSorter.sortByField, item1, {}),
                        t2 = notPath.get(thatSorter.sortByField, item2, {});
                    if (isNaN(t1)) {
                        if (
                            typeof t1 !== "undefined" &&
                            typeof t2 !== "undefined" &&
                            t1.localeCompare
                        ) {
                            return (
                                t1.localeCompare() * -thatSorter.sortDirection
                            );
                        } else {
                            return 0;
                        }
                    } else {
                        return (t1 < t2 ? 1 : -1) * thatSorter.sortDirection;
                    }
                });
                return val;
            });
        }
    }

    error() {
        if (this.options.logger) {
            this.options.logger.error(...arguments);
        }
    }

    log() {
        if (this.options.logger) {
            this.options.logger.log(...arguments);
        }
    }

    checkFieldsNames() {
        const fieldId = this.getOptions("idField");
        const pathId = ":" + fieldId;
        let fields = this.getOptions("fields", []);
        fields.forEach((field) => {
            if (pathId === field.path) {
                field.path = field.path + CONST_ID_DUBLICATE_POSTFIX;
            }
        });
    }

    readFieldValue(path, item, helpers) {
        if (path.indexOf(CONST_ID_DUBLICATE_POSTFIX) > -1) {
            const fieldId = this.getOptions("idField");
            const pathId = ":" + fieldId;
            return notPath.get(pathId, item, helpers);
        } else {
            return notPath.get(path, item, helpers);
        }
    }

    refineFiltered() {
        let result = [];
        this.checkFieldsNames();
        this.#data.filtered.forEach((item, index) => {
            let refined = {};
            if (this.getOptions("idField")) {
                refined[this.getOptions("idField")] =
                    item[this.getOptions("idField")];
            }
            this.getOptions("fields", []).forEach((field) => {
                let preprocessed = null,
                    val = this.readFieldValue(
                        field.path,
                        item,
                        this.getOptions("helpers")
                    );
                if (notCommon.objHas(field, OPT_FIELD_NAME_PRE_PROC)) {
                    try {
                        preprocessed = field[OPT_FIELD_NAME_PRE_PROC](
                            val,
                            item,
                            index
                        );
                    } catch (e) {
                        this.error(
                            "Error while preprocessing cell value",
                            val,
                            item,
                            index
                        );
                        this.error(e);
                    }
                    notPath.set(field.path, refined, preprocessed);
                } else {
                    notPath.set(field.path, refined, val);
                }
            });
            result.push(refined);
        });
        this.updateStore('refined',(val) => {
            val.splice(0, val.length, ...result);
            return val;
        });
    }

    $destroy() {
        for (let name in this.#ui) {
            this.#ui[name].$destroy && this.#ui[name].$destroy();
            delete this.#ui[name];
        }
    }
}

export default notTable;
