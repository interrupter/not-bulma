/* global notFramework */
const ERROR_DEFAULT = 'Что пошло не так.';
import Common from './common.js';

import {
	Table as notTable,
	Breadcrumbs,
	UIError,
	Form
} from 'not-bulma';

const BREADCRUMBS = [];

class ncCRUD extends notFramework.notController {
	constructor(app, params) {
		super(app);
		this.log('CRUD Controller');
		this.ui = {};
		this.els = {};
		this.setOptions('names', {
			plural: 'plural',
			single: 'single',
		});
		this.setOptions('containerSelector', this.app.getOptions('crud.containerSelector'));
		this.setOptions('params', params);
		this.buildFrame();
		return this;
	}

	start(){
		BREADCRUMBS.splice(0, BREADCRUMBS.length ,{
			title: this.getOptions('names.plural'),
			url: this.getModelURL()
		});
		Breadcrumbs.setHead(BREADCRUMBS).render({
			root: this.app.getOptions('router:root'),
			target: this.els.top,
			navigate: (url) => this.app.getWorking('router').navigate(url)
		});
		this.preloadVariants();
		this.route(this.getOptions('params'));
	}

	getModel(){
		return this.make[this.getModuleName()];
	}

	setBreadcrumbs(tail) {
		Breadcrumbs.setTail(tail).update();
	}

	backToList() {
		this.app.getWorking('router').navigate(this.linkBackToList());
	}

	afterAction(action = 'list'){
		let navBack = this.app.getOptions('crud.navigateBackAfter', []);
		if(navBack && Array.isArray(navBack) && navBack.indexOf(action) > -1){
			window.history.back();
		}else{
			this.backToList();
		}
	}

	linkBackToList() {
		return this.getModelURL();
	}

	buildFrame() {
		let el = document.querySelector(this.app.getOptions('crud.containerSelector', 'body'));
		while (el.firstChild) {
			el.removeChild(el.firstChild);
		}
		this.els.top = document.createElement('div');
		this.els.top.id = 'crud-top';
		this.els.top.classList.add('box');
		el.appendChild(this.els.top);
		this.els.main = document.createElement('div');
		this.els.main.id = 'crud-main';
		this.els.main.classList.add('box');
		el.appendChild(this.els.main);
		this.els.bottom = document.createElement('div');
		this.els.bottom.id = 'crud-bottom';
		this.els.bottom.classList.add('box');
		el.appendChild(this.els.bottom);
	}

	async preloadVariants(type = 'list'){
		try{
			if (['create','update','list','delete','details'].indexOf(type)===-1) { return; }
			let preload = this.getOptions(`${type}.preload`, {});
			if(Object.keys(preload).length == 0){
				preload = this.getOptions(`preload`, {});
			}
			if(Object.keys(preload).length > 0){
				let libProps = Object.keys(preload);
				let proms = [];
				libProps.forEach((prop)=>{
					let modelName = notFramework.notCommon.lowerFirstLetter(preload[prop]);
					let Model = this.make[modelName]({});
					proms.push(Model.$listAll());
				});
				let results = await Promise.all(proms);
				for(let i = 0; i < libProps.length; i++){
					if(Array.isArray(results[i])){
						Form.addVariants(libProps[i], results[i].map(item => {
							return {id: item._id, title: item.title};
						}));
					}
				}
			}
			this.log('preload finished');
		}catch(e){
			this.error(e);
		}
	}

	getTitleFromLib(propName, id){
		return Form.getVariantTitle(propName, id);
	}

	createDefault() {
		let newRecord = this.getModel()({
			'_id': null,
			title: this.getOptions('names.single'),
			products: []
		});
		return newRecord;
	}


	route(params = []) {
		if (params.length == 1) {
			if (params[0] === 'create') {
				return this.runCreate(params);
			} else {
				return this.runDetails(params);
			}
		} else if (params.length == 2) {
			if (params[1] === 'delete') {
				return this.runDelete(params);
			} else if (params[1] === 'update') {
				return this.runUpdate(params);
			} else {
				let routeRunnerName = 'run' + notFramework.notCommon.capitalizeFirstLetter(params[1]);
				if (this[routeRunnerName] && typeof this[routeRunnerName] === 'function') {
					return this[routeRunnerName](params);
				}
			}
		}
		return this.runList(params);
	}

	async runCreate() {
		await this.preloadVariants('create');
		this.setBreadcrumbs([{
			title: 'Добавление',
			url: '/'+this.getModuleName()+'/create'
		}]);
		if (this.ui.create) {
			return;
		} else {
			this.$destroyUI();
		}
		let manifest = this.app.getInterfaceManifest()[this.getModuleName()];
		this.ui.create = Form.build({
			target: this.els.main,
			manifest,
			action: 'create',
			options: {},
			validators: this.getOptions('Validators'),
			data: this.createDefault()
		});
		this.ui.create.$on('submit', (ev) => this.onCreateFormSubmit(ev.detail));
		this.ui.create.$on('reject', this.goList.bind(this));
	}

	async runDetails(params) {
		await this.preloadVariants('details');
		this.setBreadcrumbs([{
			title: 'Просмотр',
			url: '/'+this.getModuleName()+`/${params[0]}`
		}]);

		if (this.ui.details) {
			return;
		} else {
			this.$destroyUI();
		}

		let manifest = this.app.getInterfaceManifest()[this.getModuleName()];
		this.getModel()({
			_id: params[0]
		}).$get().then((res) => {
			if (res.status === 'ok') {
				this.ui.details = Form.build({
					target: this.els.main,
					manifest,
					action: 'get',
					options: {
						readonly: true
					},
					validators: this.getOptions('Validators'),
					data: notFramework.notCommon.stripProxy(res.result)
				});
			} else {
				this.error(res);
				this.ui.error = new UIError({
					target: this.els.main,
					props: {
						title: 'Произошла ошибка',
						message: res.error ? res.error : ERROR_DEFAULT
					}
				});
			}
		})
			.catch(this.error.bind(this));
	}

	async runUpdate(params) {
		await this.preloadVariants('update');
		this.setBreadcrumbs([{
			title: 'Редактирование',
			url: '/' + this.getModuleName() + `/${params[0]}/update`
		}]);

		if (this.ui.update) {
			return;
		} else {
			this.$destroyUI();
		}
		let manifest = this.app.getInterfaceManifest()[this.getModuleName()];
		this.getModel()({
			_id: params[0]
		}).$getRaw().then((res) => {
			if (res.status === 'ok') {
				this.setBreadcrumbs([{
					title: `Редактирование "${res.result.title}"`,
					url: '/'+this.getModuleName()+`/${params[0]}/update`
				}]);

				this.ui.update = Form.build({
					target: this.els.main,
					manifest,
					action: 'update',
					options: {},
					validators: this.getOptions('Validators'),
					data: notFramework.notCommon.stripProxy(res.result)
				});

				this.ui.update.$on('submit', (ev) => {
					this.onUpdateFormSubmit(ev.detail);
				});

				this.ui.update.$on('reject', this.goList.bind(this));
			} else {
				this.ui.error = new UIError({
					target: this.els.main,
					props: {
						title: 'Произошла ошибка',
						message: res.error ? res.error : ERROR_DEFAULT
					}
				});
			}
		})
			.catch(this.error.bind(this));
	}

	async runDelete(params) {
		await this.preloadVariants('delete');
		this.setBreadcrumbs([{
			title: 'Удаление',
			url: '/'+this.getModuleName()+`/${params[0]}/delete`
		}]);

		if (confirm('Удалить запись?')) {
			this.getModel()({
				_id: params[0]
			}).$delete()
				.then(() => {
					this.goList();
				})
				.catch((e) => {
					this.error(e);
					this.goList();
				});
		} else {
			this.goList();
		}
	}

	async runList() {
		await this.preloadVariants('list');
		this.setBreadcrumbs([{
			title: 'Список',
			url: `/`+this.getModuleName()
		}]);

		if (this.ui.list) {
			return;
		} else {
			this.$destroyUI();
		}

		this.ui.list = new notTable({
			options: {
				targetEl: this.els.main,
				interface: {
					combined: true,
					factory: this.getModel()
				},
				endless: false,
				preload: {},
				pager: {
					size: 50,
					page: 0
				},
				sorter: {
					id: -1
				},
				actions: [{
					title: 'Создать',
					action: this.goCreate.bind(this)
				}],
				fields: this.getOptions('list.fields')
			}
		});
	}

	goCreate() {
		this.app.getWorking('router').navigate('/' + [this.getModelURL(), 'create'].join('/'));
	}

	goDetails(value) {
		this.app.getWorking('router').navigate('/' + [this.getModelURL(), value].join('/'));
	}

	goUpdate(value) {
		this.app.getWorking('router').navigate('/' + [this.getModelURL(), value, 'update'].join('/'));
	}

	goDelete(value) {
		this.app.getWorking('router').navigate('/' + [this.getModelURL(), value, 'delete'].join('/'));
	}

	goList() {
		this.app.getWorking('router').navigate('/' + this.getModelURL());
	}

	onCreateFormSubmit(item) {
		this.ui.create.setLoading();
		this.getModel()(item).$create()
			.then((res) => {
				this.log(res);
				this.showResult(this.ui.create, res);
				if (!Common.isError(res) && !res.error) {
					setTimeout(() => this.goList(this.app), 3000);
				}
			})
			.catch((e) => {
				this.showResult(this.ui.create, e);
			});
	}

	onUpdateFormSubmit(item) {
		this.ui.update.setLoading();
		this.getModel()(item).$update()
			.then((res) => {
				this.showResult(this.ui.update, res);
				if (!Common.isError(res) && !res.error) {
					setTimeout(() => this.goList(this.app), 3000);
				}
			})
			.catch((e) => {
				this.showResult(this.ui.update, e);
			});
	}

	showResult(ui, res) {
		ui.resetLoading();
		if (Common.isError(res)) {
			notFramework.notCommon.report(res);
		} else {
			if (res.errors && Object.keys(res.errors).length > 0) {
				if (!Array.isArray(res.error)) {
					res.error = [];
				}
				Object.keys(res.errors).forEach((fieldName) => {
					ui.setFieldInvalid(fieldName, res.errors[fieldName]);
					res.error.push(...res.errors[fieldName]);
				});
			}
			if (res.error) {
				ui.setFormError(res.error);
			}
			if (!res.error) {
				ui.showSuccess();
			}
		}
	}


	$destroyUI() {
		for (let name in this.ui) {
			this.ui[name].$destroy && this.ui[name].$destroy();
			delete this.ui[name];
		}
	}

}

export default ncCRUD;
