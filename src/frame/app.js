import notCommon from "./common.js";
import notRecord from "./record.js";
import notBase from "./base.js";
import notRouter from "./router.js";

/**
 * @const {string} [OPT_CONTROLLER_PREFIX = "nc"] controller names prefix nc aka NotController
 */
const OPT_CONTROLLER_PREFIX = "nc";
/**
 * @const {string} [OPT_RECORD_PREFIX = "nr"] record names prefix nr aka NotRecord
 */
const OPT_RECORD_PREFIX = "nr";
/**
 * @const {string} [DEFAULT_WS_CLIENT_NAME = "main"] default name of WS client
 */
const DEFAULT_WS_CLIENT_NAME = "main";

/**
 * Class of application
 * @class
 */
class notApp extends notBase {
    /**
     *  @static {function} DEFAULT_WS_CLIENT_NAME  function to perform deep merges of objects
     */
    static DEFAULT_WS_CLIENT_NAME = DEFAULT_WS_CLIENT_NAME;
    /**
     * @class
     * @param {object} options              application options
     * @param {string} options.name         name
     * @param {object} options.controllers  controllers
     * @param {string}  options.manifestURL URL of network manifest with all available models/actions/fields requests options
     */
    constructor(options) {
        super({
            working: {
                name: options.name,
                interfaces: {},
                controllers: notCommon.objHas(options, "controllers")
                    ? options.controllers
                    : {},
                initController: null,
                currentController: null,
                uis: {},
                wsc: {},
                wss: {},
                services: {},
            },
            options,
        });
        this?.log && this.log("start app");
        notCommon.register("app", this);
        this.initManifest();
        return this;
    }

    /**
     * Initializes application according to network manifest, which is retrieved from server
     */
    initManifest() {
        notCommon
            .getJSON(this.getOptions("manifestURL"))
            .then(this.setInterfaceManifest.bind(this))
            .catch(notCommon.report.bind(this));
    }

    /**
     * One page routing initialization
     */
    initRouter() {
        this.setWorking("router", notRouter);
        this.getWorking("router").setRoot(this.getOptions("router.root"));
        notRouter.reRouteExisted();
    }

    /**
     * Creates all the routes handlers and pushes them into router
     */
    execRouter() {
        var routieInput = {};
        for (let t = 0; t < this.getOptions("router.manifest").length; t++) {
            let routeBlock = this.getOptions("router.manifest")[t],
                paths = routeBlock.paths,
                schemes = routeBlock.schemes,
                controller = routeBlock.controller;
            for (let i = 0; i < paths.length; i++) {
                let pathScheme =
                    schemes && Array.isArray(schemes) && schemes.length > i
                        ? schemes[i]
                        : false;
                routieInput[paths[i]] = this.bindController(
                    controller,
                    pathScheme
                );
            }
        }
        this.getWorking("router").addList(routieInput).listen(); //.navigate(this.getOptions('router.index'));
    }

    /**
     * Sets interface manifest option
     * @param {object}  manifest    interface manifest
     */
    setInterfaceManifest(manifest) {
        this.setOptions("interfaceManifest", manifest);
        this.initRouter();
        this.update();
    }

    /**
     * returns constructor of interface model
     * @param {string}  modelName   model name
     * @returns {object}    interface model constructor
     */
    getInterfaceManifest(modelName) {
        if (modelName) {
            return this.getOptions("interfaceManifest")[modelName];
        } else {
            return this.getOptions("interfaceManifest");
        }
    }

    /**
     * Updating Application, reloads interfaces, init controller launched, start again
     */
    update() {
        //нужно инициализировать
        //модели полученными интерфейсами
        this.updateInterfaces();
        //иницилицировать и запустить контроллер инициализации
        this.initController();
        this.startApp();
    }

    /**
     * Initialization of services, startup of routing
     */
    startApp() {
        this.initServices();
        //создать контроллеры
        //роутер и привязать к нему контроллеры
        this.execRouter();
        this.emit("afterStarted", this);
    }

    /**
     *
     * @param {object} controllerName controller constructor
     * @param {string[]} controllerPathScheme
     * @returns {function} function creates new controller instance and pass in notApp instance, arguments from router parser and pathScheme
     */
    bindController(controllerName, controllerPathScheme) {
        let app = this;
        return function () {
            new controllerName(app, arguments, controllerPathScheme);
        };
    }

    /**
     * Initializes 'initialization' controller which is runs once,
     * to perform custom initializations routines by application code
     */
    initController() {
        if (typeof this.getOptions("initController") !== "undefined") {
            let initController = this.getOptions("initController");
            this.setWorking("initController", new initController(this));
        }
    }

    /**
     * Returns working controller
     * @returns {object} working controller
     */
    getCurrentController() {
        return this.getWorking("currentController");
    }

    /**
     * Destroyes working controller then sets provided as working
     * @param {object} ctrl controller instance
     * @returns {object} notApp instance
     */
    setCurrentController(ctrl) {
        let oldCtrl = this.getCurrentController();
        if (oldCtrl && oldCtrl.destroy) {
            oldCtrl.destroy();
        }
        this.setWorking("currentController", ctrl);
        return this;
    }

    /**
     * Clears interfaces, recreates all according to Options.interafaceManifest
     */
    updateInterfaces() {
        this.clearInterfaces();
        let manifests = this.getOptions("interfaceManifest");
        if (manifests) {
            for (let name in manifests) {
                let recordManifest = manifests[name],
                    recordMethods = this.getOptions(
                        ["models", name].join("."),
                        {}
                    );
                recordManifest.methods = recordMethods;
                this.getWorking("interfaces")[name] = (recordData) =>
                    new notRecord(recordManifest, recordData);
                window["nr" + notCommon.capitalizeFirstLetter(name)] =
                    this.getWorking("interfaces")[name];
            }
        }
    }

    /**
     * Converts interface name (modelName) to standartizied prefixModelName
     * @param {string} name interface model name
     * @returns {string}    not record name
     */
    getRecordName(name) {
        return OPT_RECORD_PREFIX + notCommon.capitalizeFirstLetter(name);
    }

    /**
     * Converts controller name (controllerName) to standartizied prefixControllerName
     * @param {string} name controller name
     * @returns {string}    not controller name
     */
    getControllerName(name) {
        return OPT_CONTROLLER_PREFIX + notCommon.capitalizeFirstLetter(name);
    }

    /**
     * Returns all network interfaces
     * @returns {object} all network insterfaces
     */
    getInterfaces() {
        return this.getWorking("interfaces");
    }

    /**
     * Sets interfaces list clear
     * @returns {object} notApp instance
     */
    clearInterfaces() {
        this.setWorking("interfaces", {});
        return this;
    }

    /**
     * Sets WebSockets client
     * @param {string} [name=DEFAULT_WS_CLIENT_NAME] name of client
     * @param {object} wsc  notWSClient instance
     * @returns {object} notApp instance
     */
    // @ts-ignore
    setWSClient(name = DEFAULT_WS_CLIENT_NAME, wsc) {
        return this.setWorking(`wsc.${name}`, wsc);
    }

    /**
     * Returns web sockets client instance by name
     * @param {string} [name=DEFAULT_WS_CLIENT_NAME]
     * @returns {object} instance of notWSClient
     */
    getWSClient(name = DEFAULT_WS_CLIENT_NAME) {
        return this.getWorking(`wsc.${name}`);
    }

    /**
     * returns network interface class initializator
     * @param {string} name name of network interface
     * @returns {function} interface class initializator
     */
    getInterface(name) {
        return this.getInterfaces()[name];
    }

    /**
     * Returns network interface (model) initialized with provided data
     * @param {string} name interface(modelName)
     * @param {object} [data={}]    model data
     * @returns network interface initializes with provided data
     */
    getModel(name, data = {}) {
        return this.getInterface(name)(data);
    }

    /**
     * Sets service
     * @param {string} name name of the service
     * @param {object|function} val service
     */
    setService(name, val) {
        return this.setWorking(`services.${name}`, val);
    }

    /**
     * Returns service
     * @param {string} name name of the service
     * @returns {object|function} service
     */
    getService(name) {
        return this.getWorking(`services.${name}`);
    }

    /**
     * Initializes all provided services
     */
    initServices() {
        if (this.getOptions("services")) {
            for (let servName in this.getOptions("services")) {
                try {
                    let serv = this.getOptions(`services.${servName}`);
                    const servType = notCommon.detectType(serv);
                    switch (servType) {
                        case "function":
                        case "class":
                            this.setService(servName, new serv(this));
                            break;
                        default:
                            this.setService(servName, serv);
                    }
                } catch (e) {
                    this?.error &&
                        this.error(`Service (${servName}) init error`, e);
                }
            }
        }
    }

    /**
     * Returns module dedicated options reader
     * @param {string} moduleName   module name
     * @returns {object} reader object {get(pathToValue, defaultValue)}
     */
    getConfigReaderForModule(moduleName = "") {
        const modConfPath = ["modules", moduleName].join(".");
        return {
            get: (subPath, fallback) => {
                if (subPath && typeof subPath == "string" && subPath.length) {
                    return this.getOptions(
                        [modConfPath, subPath].join("."),
                        fallback
                    );
                } else {
                    return this.getOptions(modConfPath, fallback);
                }
            },
        };
    }

    /**
     * Returns module dedicated options reader
     * @param {string} [moduleName='']   module name
     * @returns {object} reader object {get(pathToValue, defaultValue)}
     */
    moduleConfig(moduleName = "") {
        return this.getConfigReaderForModule(moduleName);
    }
}
export default notApp;
