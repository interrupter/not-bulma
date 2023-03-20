import notCommon from "./common.js";
import notRecord from "./record.js";
import notBase from "./base.js";
import notRouter from "./router.js";

const OPT_CONTROLLER_PREFIX = "nc",
    OPT_RECORD_PREFIX = "nr",
    DEFAULT_WS_CLIENT_NAME = "main";

export default class notApp extends notBase {
    static DEFAULT_WS_CLIENT_NAME = DEFAULT_WS_CLIENT_NAME;
    constructor(options) {
        super({
            working: {
                name: options.name,
                interfaces: {},
                controllers: Object.prototype.hasOwnProperty.call(
                    options,
                    "controllers"
                )
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
        this.log("start app");
        notCommon.register("app", this);
        this.initManifest();
        return this;
    }

    initManifest() {
        notCommon
            .getJSON(this.getOptions("manifestURL"), {})
            .then(this.setInterfaceManifest.bind(this))
            .catch(notCommon.report.bind(this));
    }

    initRouter() {
        this.setWorking("router", notRouter);
        this.getWorking("router").setRoot(this.getOptions("router.root"));
        notRouter.reRouteExisted();
    }

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

    setInterfaceManifest(manifest) {
        this.setOptions("interfaceManifest", manifest);
        this.initRouter();
        this.update();
    }

    getInterfaceManifest(modelName) {
        if (modelName) {
            return this.getOptions("interfaceManifest")[modelName];
        } else {
            return this.getOptions("interfaceManifest");
        }
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
        this.initServices();
        //создать контроллеры
        //роутер и привязать к нему контроллеры
        this.execRouter();
        this.emit("afterStarted", this);
    }

    bindController(controllerName, controllerPathScheme) {
        let app = this;
        return function () {
            new controllerName(app, arguments, controllerPathScheme);
        };
    }

    initController() {
        if (typeof this.getOptions("initController") !== "undefined") {
            let initController = this.getOptions("initController");
            this.setWorking("initController", new initController(this));
        }
    }

    getCurrentController() {
        return this.getWorking("currentController");
    }

    setCurrentController(ctrl) {
        let oldCtrl = this.getCurrentController();
        if (oldCtrl && oldCtrl.destroy) {
            oldCtrl.destroy();
        }
        this.setWorking("currentController", ctrl);
        return this;
    }

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

    getRecordName(name) {
        return OPT_RECORD_PREFIX + notCommon.capitalizeFirstLetter(name);
    }

    getControllerName(name) {
        return OPT_CONTROLLER_PREFIX + notCommon.capitalizeFirstLetter(name);
    }

    getInterfaces() {
        return this.getWorking("interfaces");
    }

    clearInterfaces() {
        this.setWorking("interfaces", {});
        return this;
    }

    setWSClient(name = DEFAULT_WS_CLIENT_NAME, wsc) {
        return this.setWorking(`wsc.${name}`, wsc);
    }

    getWSClient(name = DEFAULT_WS_CLIENT_NAME) {
        return this.getWorking(`wsc.${name}`);
    }

    getInterface(name) {
        return this.getInterfaces()[name];
    }

    getModel(name, data = {}) {
        return this.getInterface(name)(data);
    }

    setService(name, val) {
        return this.setWorking(`services.${name}`, val);
    }

    getService(name) {
        return this.getWorking(`services.${name}`);
    }

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
                    this.error(`Service (${servName}) init error`, e);
                }
            }
        }
    }

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

    moduleConfig(moduleName = "") {
        return this.getConfigReaderForModule(moduleName);
    }
}
