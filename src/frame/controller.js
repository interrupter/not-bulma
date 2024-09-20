import notCommon from "./common.js";
import notBase from "./base.js";
import { NAVIGATION_DELAY_DEFAULT } from "./const.js";

/**
 * @const {string}  [OPT_DEFAULT_ACTION_NAME = "default"]      default action name
 */
const OPT_DEFAULT_ACTION_NAME = "default";

/**
 * @const {string}  [OPT_DEFAULT_CONTAINER_SELECTOR = "main.content"]  selector of container HTML
 *                          element
 */
const OPT_DEFAULT_CONTAINER_SELECTOR = "main.content";

/**
 * @const {string}  [OPT_DEFAULT_PLURAL_NAME = "Models"]  default plural name of entities
 */
const OPT_DEFAULT_PLURAL_NAME = "Models";

/**
 * @const {string}  [OPT_DEFAULT_SINGLE_NAME = "Model"]  default single name of entities
 */
const OPT_DEFAULT_SINGLE_NAME = "Model";

/**
 * @const {string}  [OPT_DEFAULT_MODULE_NAME="main"]  default module name
 */
const OPT_DEFAULT_MODULE_NAME = "main";

/**
 * @const {boolean}  [OPT_DEFAULT_AUTO_NAME = true]  if shoould be used auto name generator
 */
const OPT_DEFAULT_AUTO_NAME = true;

/*
 *  Basic class for user controller
 */
class notController extends notBase {
    /**
     *  @static {number} PARAMS_LENGTH  number of params in URL path
     */
    static PARAMS_LENGTH = 2;
    /**
     *  @static {string} MODULE_NAME  name of module
     */
    static get MODULE_NAME() {
        return OPT_DEFAULT_MODULE_NAME;
    }
    /**
     *  @static {string} MODEL_NAME  name of model
     */
    static get MODEL_NAME() {
        return "ModelName";
    }

    static get LABELS() {
        return {
            plural: `${OPT_DEFAULT_MODULE_NAME}:model_label_plural`,
            single: `${OPT_DEFAULT_MODULE_NAME}:model_label_single`,
        };
    }

    /**
     *
     * @type    {object|null}
     * @memberof notController
     */
    els;
    /**
     *
     * @type    {object|null}
     * @memberof notController
     */
    make;
    /**
     *
     * @type    {null|import('./app.js').default}
     * @memberof notController
     */
    app;
    /**
     *  @class
     *  @param {import('./app.js').default} app
     *  @param  {string}    name
     */
    constructor(app, name) {
        super({});
        this.app = app;
        this.app.setCurrentController(this);
        this.setWorking({
            name,
            ready: false,
            views: {},
            libs: {},
            helpers: {},
        });
        this.ui = {};
        this.els = {};
        this.setData({});
        this.setOptions({
            moduleName: OPT_DEFAULT_MODULE_NAME,
            containerSelector: OPT_DEFAULT_CONTAINER_SELECTOR,
            prefix: app.getOptions("paths.module"),
            names: {
                plural: OPT_DEFAULT_PLURAL_NAME,
                single: OPT_DEFAULT_SINGLE_NAME,
            },
        });
        this.setURLPrefix(app.getOptions("router.root"));
        /*
      сразу делаем доступными модели notRecord из nc`ControllerName` будут доступны как this.nr`ModelName`
    */
        let interfaces = app.getInterfaces();
        this.make = {};
        for (let t in interfaces) {
            if (Object.hasOwn(interfaces, t)) {
                this.make[t] = interfaces[t];
            }
        }
        this.on("destroy", () => {
            this.app = null;
            for (let uiName in this.ui) {
                this.ui[uiName].destroy && this.ui[uiName].destroy();
                this.ui[uiName].$destroy && this.ui[uiName].$destroy();
                this.ui[uiName] = null;
            }
            this.els = null;
            this.make = null;
        });
        return this;
    }

    /**
     *  Returns current notApp
     *  @return {import('./app.js').default}
     */
    getApp() {
        return notCommon.getApp();
    }

    /**
     *  Sets default controller model
     *  @param {import('./record.js')}  model  notRecord interface object
     *  @return {notController}
     */
    setModel(model) {
        this.setWorking("model", model);
        return this;
    }

    /**
     *  If zero or one argument provided this modelName instance will be returned
     *  If two provided and first is a string than instance of name will be returned initialized with second object param or empty object
     *  @param {string|object}      name    modelName of instance to return or initial data for instance
     *  @param {object}             data    model data
     *  @return {import('./record.js')}
     */
    getModel(name, data = undefined) {
        if (typeof name === "string") {
            const int = this.getInterface(name);
            return int && int(data || {});
        } else {
            const int = this.getInterface();
            return int && int(name || {});
        }
    }

    /**
     * Returns controller interface if name is not specified or interface of specified
     *
     * @param {string} [name=""]
     * @return {*}
     * @memberof notController
     */
    getInterface(name = "") {
        return this.app?.getInterface(name || this.getModelName());
    }

    /**
     *  Returns current model name
     *  @return {string}
     */
    getModelName() {
        return this.getWorking("modelName");
    }
    /**
     *  Sets default controller model name
     *  @param {string}  modelName  notRecord interface object
     *  @return {notController}
     */
    setModelName(modelName) {
        this.setWorking("modelName", notCommon.lowerFirstLetter(modelName));
        return this;
    }

    /**
     *  Returns current model primary ID field name
     *  @return {import('./record.js')}
     */
    getModelIDFieldName() {
        return this.getWorking("modelIDFieldName", "_id");
    }

    /**
     *  Sets current model primary ID field name
     *  @return {notController}
     */
    setModelIDFieldName(val = "_id") {
        return this.setWorking("modelIDFieldName", val);
    }

    /**
     *  Marks this controller as ready
     *  emits "ready"/"busy" events
     *  @param {Boolean}  val  true/false
     */
    setReady(val = true) {
        this.setWorking("ready", val);
        val ? this.emit("ready") : this.emit("busy");
    }

    /**
     *  Sets module URL prefix
     *  @param {string} val URL prefix
     *  @return {notController} this
     */
    setURLPrefix(val) {
        this.setOptions("urlPrefix", val);
        this.updateAutoName();
        return this;
    }

    /**
     *  Returns module url prefix
     *  @return  {string} prefix
     */
    getURLPrefix() {
        return this.getOptions("urlPrefix");
    }

    /**
     *  Sets module name
     *  @param {string} val name of the module
     *  @return {notController} this
     */
    setModuleName(val) {
        this.setOptions("moduleName", notCommon.lowerFirstLetter(val));
        this.updateAutoName();
        return this;
    }
    /**
     *  Returns module name
     *  @return  {string} module name
     */
    getModuleName() {
        return this.getOptions("moduleName");
    }

    /**
     *  Returns this module path prefix
     *  @return {string}  path to module dir
     */
    getModulePrefix() {
        return [
            notCommon.getApp().getOptions("paths.modules"),
            this.getModuleName(),
        ].join("/");
    }

    /**
     *  Returns this model URL with URL prefix
     *  @return {string}  url path
     */
    getModelURL() {
        return notCommon.buildURL({
            prefix: this.getURLPrefix(),
            module: this.getModuleName(),
            model: this.getModelName(),
        });
    }

    /**
     *  Returns this model action URL with URL prefix
     * @param  {string}   id       some identificator of model
     * @param  {string}   action   action name
     *  @return {string}  url path
     */
    getModelActionURL(id, action = "") {
        return notCommon.buildURL({
            prefix: this.getURLPrefix(),
            module: this.getModuleName(),
            model: this.getModelName(),
            id,
            action,
        });
    }

    /**
     * Creates url from value content
     * @param {object}  val
     **/
    buildURL(val) {
        return notCommon.buildURL(val);
    }

    /**
     *  Updates working name
     *  @return {notController} this
     */
    updateAutoName() {
        if (this.getOptions("autoName", OPT_DEFAULT_AUTO_NAME)) {
            //this.setWorking('name', this.getModelURL());
        }
        return this;
    }

    /**
     *  Sets object name
     *  @param {string} val name of the object
     *  @return {notController} this
     */
    setName(val) {
        this.setWorking("name", val);
        this.setOptions("autoName", false);
        return this;
    }

    /**
     *  Gets object name
     *  @return {string}
     */
    getName(val) {
        return this.getWorking("name");
    }

    /**
     *  Preload records from server, using listAll method,
     *  returns Promise
     *  @param {object}  list  map of preloaded records
     *  @return {Promise}
     */
    preloadLib(list = {}) {
        return new Promise((resolve, reject) => {
            if (typeof list !== "object") {
                resolve(undefined);
            } else {
                this.setWorking("loading", []);
                for (let t in list) {
                    this.getWorking("loading").push(list[t]);
                    this.make[list[t]]({})
                        .$listAll()
                        .then((data) => {
                            if (!this.getOptions("libs")) {
                                this.setOptions("libs", {});
                            }
                            this.getOptions("libs")[t] = data;
                            if (
                                this.getWorking("loading").indexOf(list[t]) > -1
                            ) {
                                this.getWorking("loading").splice(
                                    this.getWorking("loading").indexOf(list[t]),
                                    1
                                );
                            }
                            if (this.getWorking("loading").length === 0) {
                                resolve(undefined);
                            }
                        })
                        .catch((err) => {
                            this.report(err);
                            reject();
                        });
                }
                if (this.getWorking("loading").length === 0) {
                    resolve(undefined);
                }
            }
        });
    }

    /**
     * emits afterRender event
     */
    onAfterRender() {
        this.emit("afterRender");
    }

    /**
     *  Transform route name in action name
     *  @param {String}   name tranform action name
     *  @return {String}
     */
    getActionName(name = OPT_DEFAULT_ACTION_NAME) {
        return "run" + notCommon.capitalizeFirstLetter(name);
    }

    /**
     *  Get default controller action name
     *  @return {String} default action from options
     */
    getDefaultActionName() {
        return this.getActionName(
            this.getOptions("defaultAction", OPT_DEFAULT_ACTION_NAME)
        );
    }

    /**
     *  Route params into specific run[Route_name] function
     *  @param {array}   params   controller input params
     *  @return {undefined}
     */
    route(params) {
        let [routerName, ...subParams] = params,
            actionName = this.getActionName(
                routerName ? routerName : OPT_DEFAULT_ACTION_NAME
            );
        if (typeof this[actionName] === "function") {
            this.setCurrentAction(actionName);
            this[actionName](subParams);
        } else if (this[this.getDefaultActionName()]) {
            this.setCurrentAction(this.getDefaultActionName());
            this[this.getDefaultActionName()](subParams);
        } else {
            this.setCurrentAction(undefined);
            this.error && this.error("No action in router", params);
        }
    }

    /**
     * Sets working action
     * @params {string} actionName current action name
     */
    setCurrentAction(actionName) {
        this.setWorking("action", actionName);
    }

    /**
     * Gets working action
     * @returns {string} current action name
     */
    getCurrentAction() {
        return this.getWorking("action");
    }

    /**
     *  Return application options
     *  @return {object}
     */
    getAppOptions() {
        try {
            return this.getApp().getOptions();
        } catch (e) {
            this.error && this.error(e);
        }
    }

    /**
     *  Returns module options
     *  @param  {string}   [moduleName]    name of the module which options requested
     *  @return {object}
     */

    getModuleOptions(moduleName) {
        try {
            return this.getApp().getOptions(
                ["modules", moduleName || this.getModuleName()].join(".")
            );
        } catch (e) {
            this.error && this.error(e);
        }
    }

    /**
     *  Returns module services
     *  @param  {string}   moduleName    name of the module which services requested
     *  @return {object}
     */

    getServices(moduleName) {
        try {
            return this.getApp().getOptions(
                ["services", moduleName || this.getModuleName()].join(".")
            );
        } catch (e) {
            this.error && this.error(e);
        }
    }

    /**
     *  Returns module components
     *  @param  {string}   moduleName    name of the module which components requested
     *  @return {object}
     */

    getComponents(moduleName) {
        try {
            return this.getApp().getOptions(
                ["components", moduleName || this.getModuleName()].join(".")
            );
        } catch (e) {
            this.error && this.error(e);
        }
    }

    /**
     *  Refreshes current URL, re-run all action
     *  @param {number} timeout time to wait in ms
     */
    refresh(timeout = 0) {
        this.app?.getWorking("router").refresh(timeout);
    }

    /**
     * Returns path pattern for router
     * @params {number} [0] paramsCount   number of params
     * @return {string}  pattern for controller supported url
     */
    static getControllerRoute(paramsCount = 0) {
        let path = [];
        if (this.MODULE_NAME && this.MODULE_NAME.length > 0) {
            path.push(notCommon.lowerFirstLetter(this.MODULE_NAME));
        }
        if (this.MODEL_NAME && this.MODEL_NAME.length > 0) {
            path.push(notCommon.lowerFirstLetter(this.MODEL_NAME));
        }
        path = [path.join("/")];
        for (let i = 0; i < paramsCount; i++) {
            path.push("/([^/]+)");
        }
        return path.join("");
    }

    /**
     * Returns path patterns for router
     * @params {number} [0] paramsDeep   how many paths with params in the end
     * @return {string[]}  patterns for controller supported url in order of simplification
     */
    static getControllerRoutes(paramsDeep = 0) {
        let routes = [this.getControllerRoute(0)];
        for (let i = 0; i < paramsDeep; i++) {
            routes.unshift(this.getControllerRoute(i + 1));
        }
        return routes;
    }

    /**
     * Returns router rule.
     * @returns {Object} router rule {paths:String[], controller:notController}
     */
    static getRoutes() {
        return {
            paths: this.getControllerRoutes(this.PARAMS_LENGTH),
            controller: this,
        };
    }

    /**
     * Returns Application router
     * @returns {import('./router.js')}
     */
    getRouter() {
        return this.app?.getWorking("router");
    }

    /**
     * Changes location to `url` after `delay` ms
     * @param {string} url
     * @param {number|string}   delay   number in ms or name of delay
     */
    navigateWithDelay(
        url,
        delay = NAVIGATION_DELAY_DEFAULT,
        doBefore = () => {}
    ) {
        return this.getRouter().navigateWithDelay(url, delay, doBefore);
    }

    /**
     * Changes location to `url`
     * @param {string} url
     */
    navigate(url) {
        return this.getRouter().navigate(url);
    }

    /**
     *  Navigating to this controller main model `action` with provided `id`,
     *  empty `id` will be dropped from resulting url
     *
     * @param {string} id
     * @param {string} [action=""]
     * @param {number} [delay=0]            delay in ms before navigate
     * @param   {function}  [doBefore]      will executed only if delayed after delay but before navigate
     * @return {*}
     * @memberof notController
     */
    navigateAction(id, action = "", delay = 0, doBefore = () => {}) {
        return this.navigateModuleAction(
            this.getModuleName(),
            this.getModelName(),
            id,
            action,
            delay,
            doBefore
        );
    }

    /**
     *  Navigating to this controller module model of `modelName` `action` with provided `id`,
     *  empty `id` will be dropped from resulting url
     *
     * @param {string} modelName
     * @param {string} id
     * @param {string} [action=""]
     * @param {number} [delay=0]            delay in ms before navigate
     * @param   {function}  [doBefore]      will executed only if delayed after delay but before navigate
     * @return {*}
     * @memberof notController
     */
    navigateModelAction(
        modelName,
        id,
        action = "",
        delay = 0,
        doBefore = () => {}
    ) {
        return this.navigateModuleAction(
            this.getModuleName(),
            modelName,
            id,
            action,
            delay,
            doBefore
        );
    }

    /**
     *  Navigating to `moduleName` `modelName` `action` with provided `id`,
     *  empty `id` will be dropped from resulting url
     *
     * @param {string} moduleName
     * @param {string} modelName
     * @param {string} id
     * @param {string} [action=""]
     * @param {number} [delay=0]            delay in ms before navigate
     * @param   {function}  [doBefore]      will executed only if delayed after delay but before navigate
     * @return {*}
     * @memberof notController
     */
    navigateModuleAction(
        moduleName,
        modelName,
        id,
        action = "",
        delay = 0,
        doBefore = () => {}
    ) {
        if (delay) {
            return this.getRouter().navigateWithDelay(
                notCommon.buildURL({
                    prefix: this.getURLPrefix(),
                    module: moduleName,
                    model: modelName,
                    id,
                    action,
                }),
                delay,
                doBefore
            );
        } else {
            return this.getRouter().navigate(
                notCommon.buildURL({
                    prefix: this.getURLPrefix(),
                    module: moduleName,
                    model: modelName,
                    id,
                    action,
                })
            );
        }
    }

    /**
     * Creates menu item from child class constructor
     *
     * @static
     * @param {notController} childConstructor
     * @return {Array<import('./types.js').NavigationItem>}
     * @memberof notController
     */
    static getCommonMenu(childConstructor) {
        return [
            {
                section: childConstructor.MODULE_NAME,
                title: childConstructor.LABELS.plural,
                url: `/${notCommon.lowerFirstLetter(
                    childConstructor.MODULE_NAME
                )}/${notCommon.lowerFirstLetter(childConstructor.MODEL_NAME)}`,
            },
        ];
    }

    static getMenu() {}
}

export default notController;
