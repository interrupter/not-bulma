import EventEmitter from 'wolfy87-eventemitter';
import notPath from 'not-path';

import * as Stores from './../stores.js';
import UITable from './notTable.svelte';

const OPT_DEFAULT_PAGE_SIZE = 20,
	OPT_DEFAULT_PAGE_NUMBER = 0,
	OPT_DEFAULT_PAGE_RANGE = 6,
	OPT_DEFAULT_SORT_DIRECTION = 1,
	OPT_DEFAULT_SEARCH = '',
	OPT_DEFAULT_RETURN = {},
	OPT_DEFAULT_COMBINED = false,
	OPT_DEFAULT_COMBINED_ACTION = 'listAndCount',
	OPT_DEFAULT_COUNT_ACTION = 'count',
	OPT_DEFAULT_LIST_ACTION = 'list',
	OPT_DEFAULT_SORT_FIELD = '_id',
	OPT_FIELD_NAME_PRE_PROC = 'preprocessor';


const DEFAULT_OPTIONS = {
	links:[],
	actions:[],
	endless: false,
	idField: '_id'
};

class notTable extends EventEmitter {
	constructor(input = {}) {
		super();
		this.id = 'table-' + Math.random();
		this.options = Object.assign(DEFAULT_OPTIONS, input.options ? input.options : {});
		this.ui = {};
		this.data = {
			raw: [],
			filtered: [],
			refined: [],
			selected: {},
		};
		this.state = {
			pagination: {
				items: {
					count: 0,
					from: 0,
					to: 0
				},
				pages: {
					count: 0,
					from: 0,
					to: 0,
					current: 0,
					list: []
				}
			}
		};
		this.working = {};

		this.stores = Stores.create(this.id, {
			'raw': [],
			'filtered': [],
			'refined': [],
			'selected': {},
			'state': this.state,
			'working': this.working
		});

		this.stores.working.subscribe(this.onWorkingUpdate.bind(this));
		//полученные из сети
		this.stores.raw.subscribe(this.onRawUpdate.bind(this));
		//применены фильтры, сортировки и т.д.
		this.stores.filtered.subscribe(this.onFilteredUpdate.bind(this));
		//урезаны до минимального набора, точно соотвествующего табличному формату
		this.stores.refined.subscribe(this.onRefinedUpdate.bind(this));
		//словарь с идентификаторами выбранных строк
		this.stores.selected.subscribe(this.onSelectedUpdate.bind(this));
		//pagination, items information
		this.stores.state.subscribe(this.onStateUpdate.bind(this));

		if (Object.prototype.hasOwnProperty.call(input, 'data') && Array.isArray(input.data)) {
			this.stores.raw.update(val => {
				val = input.data;
				return val;
			});
		}
		if(Object.prototype.hasOwnProperty.call(this.options, 'filter')){
			this.setFilter(this.options.filter);
		}else{
			this.resetFilter();
		}
		if(Object.prototype.hasOwnProperty.call(this.options, 'pager')){
			this.setPager(this.options.pager);
		}else{
			this.resetPager();
		}
		if(Object.prototype.hasOwnProperty.call(this.options, 'sorter')){
			this.setSorter(this.options.sorter);
		}else{
			this.resetSorter();
		}
		if(Object.prototype.hasOwnProperty.call(this.options, 'return')){
			this.setReturn(this.options.return);
		}else{
			this.setReturn();
		}
		if(Object.prototype.hasOwnProperty.call(this.options, 'search')){
			this.setSearch(this.options.search);
		}else{
			this.setSearch();
		}
		this.render();
		this.updateData();
		return this;
	}

	onWorkingUpdate(val) {
		this.working = val;
		return val;
	}

	onRawUpdate(val) {
		this.data.raw = val;
		return val;
	}

	onFilteredUpdate(val) {
		this.data.filtered = val;
		this.refineFiltered();
		return val;
	}

	onRefinedUpdate(val) {
		this.data.refined = val;
		this.clearSelected();
		return val;
	}

	onStateUpdate(val) {
		this.state = val;
		return val;
	}

	onSearchChange(line){
		if(line.length > 3){
			this.setSearch(line);
		}else{
			this.setSearch();
		}
	}

	onSelectedUpdate(val){
		this.data.selected = val;
	}

	clearSelected(){
		this.data.selected = {};
	}

	getSelected(object = false){
		let res = [];
		for(let id in this.data.selected){
			if(this.data.selected[id]){
				if(object){
					let indx = this.data.refined.findIndex(item => item._id === id);
					if(indx > -1){
						res.push(this.data.refined(indx));
					}
				}else{
					res.push(id);
				}
			}
		}
		return res;
	}

	render() {
		if (!this.ui.table) {
			this.ui.table = new UITable({
				target: this.options.targetEl,
				props: {
					id: this.id,
					helpers: Object.assign({}, this.getHelpers()),
					fields: this.getOptions('fields'),
					actions: this.getActions(),
					links: this.getLinks(),
					search: '',
					showSelect: this.getOptions('showSelect'),
					showSearch: this.getOptions('showSearch'),
					idField: this.getOptions('idField'),
				}
			});
		}
		this.ui.table.$on('searchChange', e => this.onSearchChange(e.detail));
		this.ui.table.$on('goToPage', e => this.goToPage(e.detail));
		this.ui.table.$on('goToNextPage', () => this.goToNext());
		this.ui.table.$on('goToPrevPage', () => this.goToPrev());
	}

	getActions(){
		return this.getOptions('actions', []);
	}

	getLinks(){
		return this.getOptions('links', []);
	}

	getHelpers() {
		return this.options.helpers || {};
	}

	setWorking(key, value) {
		this.stores.working.update(val => {
			notPath.set(key, val, this.getHelpers(), value);
			return val;
		});
		return this;
	}

	getWorking(key, def) {
		let res = notPath.get(key, this.working, this.getHelpers());
		if (res === undefined) {
			return def;
		} else {
			return res;
		}
	}

	setState(key, value) {
		this.stores.state.update(val => {
			notPath.set(key, val, this.getHelpers(), value);
			return val;
		});
		return this;
	}

	getState(key, def) {
		let res = notPath.get(key, this.state, this.getHelpers());
		if (res === undefined) {
			return def;
		} else {
			return res;
		}
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

	setFilter(hash) {
		this.setState('filter', hash);
		this.invalidateData();
		this.updateData();
	}

	resetFilter() {
		this.setState('filter', {});
	}

	getFilter() {
		return this.getState('filter');
	}

	setPager(hash) {
		this.setState('pager', hash);
		this.updateData();
	}

	getDefaultPageNumber() {
		return isNaN(this.getOptions('pager.page')) ? OPT_DEFAULT_PAGE_NUMBER : this.getOptions('pager.page');
	}

	getDefaultPageSize() {
		return isNaN(this.getOptions('pager.size')) ? OPT_DEFAULT_PAGE_SIZE : this.getOptions('pager.size');
	}

	resetPager() {
		this.setState('pager', {
			size: this.getDefaultPageSize(),
			page: this.getDefaultPageNumber(),
		});
	}

	getPager() {
		return this.getState('pager');
	}

	setSorter(hash) {
		this.setWorking('sorter', hash);
		this.invalidateData();
		this.updateData();
	}

	resetSorter() {
		let t = {};
		t[OPT_DEFAULT_SORT_FIELD] = OPT_DEFAULT_SORT_DIRECTION;
		this.setSorter(t);
	}

	getSorter() {
		return this.getWorking('sorter');
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
		let search = (typeof this.getWorking('search') !== 'undefined' && this.getWorking('search') !== null);
		return search ? this.getWorking('search') : '';
	}

	setSearch(line = OPT_DEFAULT_SEARCH) {
		this.setWorking('search', line);
		this.invalidateData();
		this.updateData();
		return this;
	}

	getReturn() {
		return this.getWorking('return');
	}

	setReturn(ret = OPT_DEFAULT_RETURN) {
		this.setWorking('return', ret);
		return this;
	}

	clearFilteredData() {
		this.stores.filtered.update((val) => {
			val.splice(0, val.length);
			return val;
		});
	}

	clearRawData() {
		this.stores.raw.update((val) => {
			val.splice(0, val.length);
			return val;
		});
	}

	clearRefinedData() {
		this.stores.refined.update((val) => {
			val.splice(0, val.length);
			return val;
		});
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
		return this.getOptions('interface') && this.getOptions('interface.factory');
	}

	setUpdating() {
		this.setState('updating', true);
	}

	setUpdated() {
		this.setState('updating', false);
	}

	ifUpdating() {
		return this.getState('updating');
	}

	getDataInterface() {
		return this.getOptions('interface.factory')({});
	}

	getLoadDataActionName() {
		return (this.getOptions('interface.listAction') ? this.getOptions('interface.listAction') : OPT_DEFAULT_LIST_ACTION);
	}

	getCombinedActionName() {
		return (this.getOptions('interface.combinedAction') ? this.getOptions('interface.combinedAction') : OPT_DEFAULT_COMBINED_ACTION);
	}

	getCountActionName() {
		return this.getOptions('interface.countAction') ? this.getOptions('interface.countAction') : OPT_DEFAULT_COUNT_ACTION;
	}

	loadData() {
		//load from server
		let query = this.getDataInterface()
				.setFilter(this.getFilter())
				.setSorter(this.getSorter())
				.setReturn(this.getReturn())
				.setSearch(this.getSearch())
				.setPager(this.getPager().size, this.getPager().page),
			actionName;
		if (this.getOptions('interface.combined', OPT_DEFAULT_COMBINED)) {
			actionName = this.getCombinedActionName();
		} else {
			actionName = this.getLoadDataActionName();
		}
		return query['$' + actionName]();
	}

	goToNext() {
		let next = isNaN(this.getState('pager.page')) ? this.getDefaultPageNumber() : this.getState('pager.page') + 1;
		this.setState('pager.page', Math.min(next, this.getState('pagination.pages.to')));
		this.updateData();
	}

	goToPrev() {
		let prev = isNaN(this.getState('pager.page')) ? this.getDefaultPageNumber() : this.getState('pager.page') - 1;
		this.setState('pager.page', Math.max(prev, this.getState('pagination.pages.from')));
		this.updateData();
	}

	goToFirst() {
		this.setState('pager.page', this.getState('pagination.pages.from'));
		this.updateData();
	}

	goToLast() {
		this.setState('pager.page', this.getState('pagination.pages.to'));
		this.updateData();
	}

	goToPage(pageNumber) {
		this.setState('pager.page', pageNumber);
		this.updateData();
	}

	testDataItem(item) {
		var strValue = this.getSearch().toLowerCase();
		for (var k in item) {
			var toComp = item[k].toString().toLowerCase();
			if (toComp.indexOf(strValue) > -1) {
				return true;
			}
		}
		return false;
	}

	getRowsCount() {
		let query = this.getDataInterface().setFilter(this.getFilter());
		return query['$' + this.getCountActionName()]()
			.then((data) => {
				this.updatePagination(data.count);
			})
			.catch((e) => {
				this.error(e);
			});
	}

	updatePagination(itemsCount) {
		this.log('update pagination', itemsCount);
		this.state.pagination.pages.list.splice(0, this.state.pagination.pages.list.length);
		let itemsFrom = (this.getPager().page - OPT_DEFAULT_PAGE_NUMBER) * this.getPager().size + 1,
			pagesCount = itemsCount % this.getPager().size ? Math.floor(itemsCount / this.getPager().size) + 1 : Math.round(itemsCount / this.getPager().size),
			pagesFrom = Math.max(OPT_DEFAULT_PAGE_NUMBER, this.getPager().page - OPT_DEFAULT_PAGE_RANGE),
			pagesTo = Math.min(pagesCount - (1 - OPT_DEFAULT_PAGE_NUMBER), this.getPager().page + OPT_DEFAULT_PAGE_RANGE),
			list = [],
			itemsTo = Math.min(itemsFrom + this.getPager().size - 1, itemsCount);
		for (let t = pagesFrom; t <= pagesTo; t++) {
			list.push({
				index: t,
				active: t === this.getPager().page
			});
		}

		this.stores.state.update(val => {
			this.log('update pagination', val);
			val.pagination.items.count = itemsCount;
			val.pagination.items.from = itemsFrom;
			val.pagination.items.to = itemsTo;
			val.pagination.pages.count = pagesCount;
			val.pagination.pages.from = pagesFrom;
			val.pagination.pages.to = pagesTo;
			val.pagination.pages.current = this.getPager().page;
			val.pagination.pages.list.splice(0, val.pagination.pages.list.length, ...list);
			return val;
		});

	}

	updateData() {
		if (this.isLive()) {
			if (this.ifUpdating()) {
				return;
			}
			if (!this.getOptions('endless', false)) {
				this.clearRawData();
			}
			this.setUpdating();
			if (this.getOptions('interface.combined', OPT_DEFAULT_COMBINED)) {
				this.loadData()
					.then((data) => {
						this.stores.filtered.update((val) => {
							if (!this.getOptions('endless', false)) {
								this.clearFilteredData();
							}
							if(Object.prototype.hasOwnProperty.call(data, 'list') && Array.isArray(data.list)){
								val.push(...(data.list));
							}else if(Array.isArray(data)){
								val.push(...data);
							}
							return val;
						});
						this.setWorking('lastCount', data.count);
					})
					.then(() => {
						this.updatePagination(this.getWorking('lastCount'));
					})
					.catch(this.error.bind(this))
					.then(this.setUpdated.bind(this));
			} else {
				this.loadData()
					.then(data => {
						this.stores.filtered.update((val) => {
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

	getData(){
		return this.data;
	}

	processData() {
		let thatFilter = this.getFilter();
		//this.getData('rows').__setPassive;
		this.log(this.getData());
		if (
			typeof thatFilter !== 'undefined' &&
			thatFilter !== null &&
			typeof thatFilter.filterSearch !== 'undefined' &&
			thatFilter.filterSearch !== null &&
			thatFilter.filterSearch.length > 0
		) {
			this.stores.filtered.update((val) => {
				val.splice(0, val.length, ...(this.data.raw.filter(this.testDataItem.bind(this))));
				return val;
			});
		} else {
			this.stores.filtered.update((val) => {
				val.splice(0, val.length, ...this.data.raw);
				return val;
			});
		}
		////sorter
		let thatSorter = this.getSorter();
		if (typeof thatSorter !== 'undefined' && thatSorter !== null) {
			this.stores.filtered.update((val) => {
				val.sort((item1, item2) => {
					let t1 = notPath.get(thatSorter.sortByField, item1, {}),
						t2 = notPath.get(thatSorter.sortByField, item2, {});
					if (isNaN(t1)) {
						if (typeof t1 !== 'undefined' && typeof t2 !== 'undefined' && t1.localeCompare) {
							return t1.localeCompare() * -thatSorter.sortDirection;
						} else {
							return 0;
						}
					} else {
						return ((t1 < t2) ? 1 : -1) * thatSorter.sortDirection;
					}
				});
				return val;
			});
		}

	}

	error() {
		if(this.options.logger){
			this.options.logger.error(...arguments);
		}
	}

	log() {
		if(this.options.logger){
			this.options.logger.log(...arguments);
		}
	}

	refineFiltered() {
		let result = [];
		this.data.filtered.forEach((item, index) => {
			let refined = {};
			if(this.getOptions('idField')){
				refined[this.getOptions('idField')] = item[this.getOptions('idField')];
			}
			this.getOptions('fields').forEach((field) => {
				let preprocessed = null,
					val = notPath.get(field.path, item, this.getOptions('helpers'));
				if (Object.prototype.hasOwnProperty.call(field, OPT_FIELD_NAME_PRE_PROC)) {
					preprocessed = field[OPT_FIELD_NAME_PRE_PROC](val, item, index);
					notPath.set(field.path, refined, preprocessed);
				} else {
					notPath.set(field.path, refined, val);
				}
			});
			result.push(refined);
		});
		this.stores.refined.update((val) => {
			val.splice(0, val.length, ...result);
			return val;
		});
	}

	$destroy(){
		for(let name in this.ui){
			this.ui[name].$destroy && this.ui[name].$destroy();
			delete this.ui[name];
		}
	}

}


export default notTable;
