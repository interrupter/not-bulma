import notCommon from './common.js';
import notRecord from './record.js';
import notBase from './base.js';
import notRouter from './router.js';

const OPT_CONTROLLER_PREFIX = 'nc',
	OPT_RECORD_PREFIX = 'nr';

export default class notApp extends notBase {
	constructor(options) {
		super({
			working:{
				name: options.name
			},
			options
		});
		this.log('start app');
		notCommon.register('app', this);
		this.setWorking({
			interfaces: {},
			controllers: {},
			initController: null,
			currentController: null
		});
		this.initManifest();
		this.preInitRouter();
		return this;
	}

	initManifest() {
		notCommon.getJSON(this.getOptions('manifestURL'), {})
			.then(this.setInterfaceManifest.bind(this))
			.catch(notCommon.report.bind(this));
	}

	preInitRouter() {
		this.setWorking('router', notRouter);
		this.getWorking('router').setRoot(this.getOptions('router.root'));
		notRouter.reRouteExisted();
	}

	initRouter() {
		var routieInput = {};
		for (let t = 0; t < this.getOptions('router.manifest').length; t++) {
			let routeBlock = this.getOptions('router.manifest')[t],
				paths = routeBlock.paths,
				controller = routeBlock.controller;
			for (let i = 0; i < paths.length; i++) {
				routieInput[paths[i]] = this.bindController(controller);
			}
		}
		this.getWorking('router').addList(routieInput).listen(); //.navigate(this.getOptions('router.index'));
	}

	setInterfaceManifest(manifest) {
		this.setOptions('interfaceManifest', manifest);
		this.update();
	}

	getInterfaceManifest() {
		return this.getOptions('interfaceManifest');
	}

	update() {
		//нужно инициализировать
		//модели полученными интерфейсами
		this.updateInterfaces();
		//иницилицировать и запустить контроллер инициализации
		this.initController();
		this.startApp();
	}

	startApp() {
		//создать контроллеры
		//роутер и привязать к нему контроллеры
		this.initRouter();
	}

	bindController(controllerName) {
		let app = this;
		return function () {
			new controllerName(app, arguments);
		};
	}

	initController() {
		if (typeof (this.getOptions('initController')) !== 'undefined') {
			let initController = this.getOptions('initController');
			this.setWorking('initController', new initController(this));
		}
	}

	getCurrentController() {
		return this.getWorking('currentController');
	}

	setCurrentController(ctrl) {
		this.setWorking('currentController', ctrl);
		return this;
	}

	updateInterfaces() {
		this.clearInterfaces();
		let manifests = this.getOptions('interfaceManifest');
		if (manifests) {
			for (let name in manifests) {
				let recordManifest = manifests[name],
					recordMethods = this.getOptions(['models', name].join('.'), {});
				recordManifest.methods = recordMethods;
				this.getWorking('interfaces')[name] = (recordData) => new notRecord(recordManifest, recordData);
				window['nr' + notCommon.capitalizeFirstLetter(name)] = this.getWorking('interfaces')[name];
			}
		}
	}

	getRecordName(name) {
		return OPT_RECORD_PREFIX + notCommon.capitalizeFirstLetter(name);
	}

	getControllerName(name) {
		return OPT_CONTROLLER_PREFIX + notCommon.capitalizeFirstLetter(name);
	}

	getInterfaces() {
		return this.getWorking('interfaces');
	}

	clearInterfaces() {
		this.setWorking('interfaces', {});
		return this;
	}


}
