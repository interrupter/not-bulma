import notPath from "not-path";

/*
https://github.com/TehShrike/is-mergeable-object

Included for convinience only. All rights belongs to their authors and etc.
start of my code marked.

*/

let isMergeableObject = function isMergeableObject(value) {
    return isNonNullObject(value) && !isSpecial(value);
};

function isNonNullObject(value) {
    return !!value && typeof value === "object";
}

function isSpecial(value) {
    var stringValue = Object.prototype.toString.call(value);

    return (
        stringValue === "[object RegExp]" ||
        stringValue === "[object Date]" ||
        isReactElement(value)
    );
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === "function" && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for("react.element") : 0xeac7;

function isReactElement(value) {
    return value.$$typeof === REACT_ELEMENT_TYPE;
}

/*
https://github.com/KyleAMathews/deepmerge

The MIT License (MIT)

Copyright (c) 2012 Nicholas Fisher

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

function emptyTarget(val) {
    return Array.isArray(val) ? [] : {};
}

function cloneUnlessOtherwiseSpecified(value, optionsArgument) {
    var clone = !optionsArgument || optionsArgument.clone !== false;

    return clone && isMergeableObject(value)
        ? deepmerge(emptyTarget(value), value, optionsArgument)
        : value;
}

function defaultArrayMerge(target, source, optionsArgument) {
    return target.concat(source).map(function (element) {
        return cloneUnlessOtherwiseSpecified(element, optionsArgument);
    });
}

function mergeObject(target, source, optionsArgument) {
    var destination = {};
    if (isMergeableObject(target)) {
        Object.keys(target).forEach(function (key) {
            destination[key] = cloneUnlessOtherwiseSpecified(
                target[key],
                optionsArgument
            );
        });
    }
    Object.keys(source).forEach(function (key) {
        if (!isMergeableObject(source[key]) || !target[key]) {
            destination[key] = cloneUnlessOtherwiseSpecified(
                source[key],
                optionsArgument
            );
        } else {
            destination[key] = deepmerge(
                target[key],
                source[key],
                optionsArgument
            );
        }
    });
    return destination;
}

function deepmerge(target, source, optionsArgument) {
    var sourceIsArray = Array.isArray(source);
    var targetIsArray = Array.isArray(target);
    var options = optionsArgument || {
        arrayMerge: defaultArrayMerge,
    };
    var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

    if (!sourceAndTargetTypesMatch) {
        return cloneUnlessOtherwiseSpecified(source, optionsArgument);
    } else if (sourceIsArray) {
        var arrayMerge = options.arrayMerge || defaultArrayMerge;
        return arrayMerge(target, source, optionsArgument);
    } else {
        return mergeObject(target, source, optionsArgument);
    }
}

deepmerge.all = function deepmergeAll(array, optionsArgument) {
    if (!Array.isArray(array)) {
        throw new Error("first argument should be an array");
    }

    return array.reduce(function (prev, next) {
        return deepmerge(prev, next, optionsArgument);
    }, {});
};

/**
 *  Collection of common functions
 *  @class
 */
class notCommon {
    /**
     *  @static {Object} [MANAGER=null]  application manager, in some cases used to control initialization routine
     */
    static MANAGER = null;
    /**
     *  @static {string} [LOG="console"]  logger, window[LOG]
     */
    static LOG = "console";
    /**
     *  @static {function} deepMerge  function to perform deep merges of objects
     */
    static deepMerge = deepmerge;

    /**
     *  @static {function} isError  function to perform object test, if it's an error object or not
     * @param   {object}    e   object to test
     */
    static isError(e) {
        return (
            e instanceof Error ||
            (Object.prototype.hasOwnProperty.call(e, "status") &&
                e.status === "error")
        );
    }

    static TZ_OFFSET = (new Date().getTimezoneOffset() / 60) * -1;
    static DEV_ENV = "production";
    static ENV_TYPE = window.NOT_ENV_TYPE
        ? window.NOT_ENV_TYPE
        : notCommon.DEV_ENV;
    static NOOP = () => {};

    static mute() {
        notCommon.ENV_TYPE = "production";
    }

    static pad(n) {
        return n < 10 ? "0" + n : n;
    }
    /**
     *  Returns today Date object without hours, minutes, seconds
     *  @return {number}  current date with 00:00:00 in ms of unix time
     */
    static getTodayDate() {
        let t = new Date();
        return new Date(t.getFullYear(), t.getMonth(), t.getDate()).getTime();
    }

    /**
     *  Returns true if object has field of name
     *   @param   {object}    obj    some object
     *  @param  {string}    name  field name
     *  @return {boolean}          if object contains field with name
     **/
    static objHas(obj, name) {
        return Object.prototype.hasOwnProperty.call(obj, name);
    }

    /**
     * Copies object to secure it from changes
     * @param {object}   obj     original object
     * @return {object}          copy of object
     **/
    static copyObj(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    /**
     * Copies object to secure it from changes
     * @param {object}   obj     original object
     * @return {object}          copy of object
     **/
    static partCopyObj(obj, list) {
        let partObj = Object.keys(obj).reduce((prev, curr) => {
            if (list.includes(curr)) {
                prev[curr] = obj[curr];
            }
            return prev;
        }, {});
        return JSON.parse(JSON.stringify(partObj));
    }

    static compareTwoArrays(a, b) {
        return (
            a.length === b.length &&
            a.every((element, index) => element === b[index])
        );
    }

    /**
     * Test argument type to be 'function'
     * @param {any}  func    possible function
     * @return {boolean}     if this is a function
     **/
    static isFunc(func) {
        return typeof func === "function";
    }

    /**
     * Returns true if argument is Async function
     * @param {function} func  to test
     * @return {boolean}       if this function is constructed as AsyncFunction
     **/
    static isAsync(func) {
        return func.constructor.name === "AsyncFunction";
    }

    /**
     *  Executes method of object in appropriate way inside Promise
     * @param {object}   obj     original object
     * @param {string}   name    method name to execute
     * @param {Array}     params  array of params
     * @return {Promise}          results of method execution
     **/
    static async executeObjectFunction(obj, name, params) {
        if (obj) {
            const proc = notPath.get(":" + name, obj);
            if (notCommon.isFunc(proc)) {
                if (notCommon.isAsync(proc)) {
                    return await proc(...params);
                } else {
                    return proc(...params);
                }
            }
        }
    }

    /**
     *  Executes method of object in apropriate way inside Promise
     * @param {Object}   from     original object
     * @param {Object}   name    method name to execute
     * @param {Array}     list  array of params
     * @return {Promise}          results of method execution
     **/
    static mapBind(from, to, list) {
        list.forEach((item) => {
            if (typeof from[item] === "function") {
                to[item] = from[item].bind(from);
            }
        });
    }

    static isClass(fn) {
        return /^\s*class/.test(fn.toString());
    }

    static detectType(testie) {
        if (typeof testie !== "function") {
            return typeof testie;
        } else {
            if (notCommon.isClass(testie)) {
                return "class";
            } else {
                return "function";
            }
        }
    }

    //Проверка является ли переменная массивом
    static isArray(data) {
        return typeof data == "object" && data instanceof Array;
    }

    static localIsoDate(date) {
        date = date || new Date();
        let localIsoString =
            date.getFullYear() +
            "-" +
            notCommon.pad(date.getMonth() + 1) +
            "-" +
            notCommon.pad(date.getDate()) +
            "T" +
            notCommon.pad(date.getHours()) +
            ":" +
            notCommon.pad(date.getMinutes()) +
            ":" +
            notCommon.pad(date.getSeconds());
        return localIsoString;
    }

    static getToday() {
        let today = new Date();
        let date =
            today.getFullYear() +
            "-" +
            notCommon.pad(today.getMonth() + 1) +
            "-" +
            notCommon.pad(today.getDate());
        return date;
    }

    static backlog = [];

    static backlogAdd(msg, type = "log") {
        if (notCommon.get("backlog") === true) {
            notCommon.backlog.push({ msg, type });
        }
    }

    static dumpBacklog() {
        while (notCommon.backlog.length) {
            let row = notCommon.backlog.shift();
            window[notCommon.LOG][row.type](...row.msg);
        }
    }

    static logMsg() {
        let now = notCommon.localIsoDate();
        // eslint-disable-next-line no-console
        window[notCommon.LOG].log(`[${now}]: `, ...arguments);
        notCommon.backlogAdd([`[${now}]: `, ...arguments], "log");
    }

    static log() {
        notCommon.logMsg(...arguments);
    }

    static createLogger(prefix) {
        return {
            log: notCommon.genLogMsg(prefix),
            error: notCommon.genLogError(prefix),
            debug: notCommon.genLogDebug(prefix),
            report: notCommon.report,
        };
    }

    //Генерация метода вывода сообщений в консоль с указанием префикса.
    static genLogMsg(prefix) {
        return function () {
            //not arrow bc of arguments special var is not available in arrow functions
            let now = notCommon.localIsoDate();
            // eslint-disable-next-line no-console
            window[notCommon.LOG].log(`[${now}]: ${prefix}::`, ...arguments);
            notCommon.backlogAdd(
                [`[${now}]: ${prefix}::`, ...arguments],
                "log"
            );
        };
    }

    /**
     * Определяет является ли окружение окружением разработки
     * @returns  {boolean} true если это запущено в окружении разработки
     **/
    static isDev() {
        return notCommon.ENV_TYPE === notCommon.DEV_ENV;
    }

    static debug() {
        if (notCommon.isDev()) {
            return notCommon.logMsg(...arguments);
        } else {
            return notCommon.NOOP;
        }
    }

    static genLogDebug(prefix) {
        if (notCommon.isDev()) {
            return notCommon.genLogMsg(prefix);
        } else {
            return notCommon.NOOP;
        }
    }

    static error() {
        notCommon.logError(...arguments);
    }

    //Функция вывода сообщения об ошибке
    static logError() {
        let now = notCommon.localIsoDate();
        // eslint-disable-next-line no-console
        window[notCommon.LOG].error(`[${now}]: `, ...arguments);
        notCommon.backlogAdd([`[${now}]: `, ...arguments], "error");
    }

    static genLogError(prefix) {
        return function () {
            //do not change to arrow function, bc of arguments
            let now = notCommon.localIsoDate();
            // eslint-disable-next-line no-console
            window[notCommon.LOG].error(`[${now}]: ${prefix}::`, ...arguments);
            notCommon.backlogAdd(
                [`[${now}]: ${prefix}::`, ...arguments],
                "error"
            );
        };
    }

    static report(e) {
        if (notCommon.getApp()) {
            let reporter = notCommon.getApp().getService("nsErrorReporter");
            if (reporter) {
                reporter.report(e).catch(notCommon.error);
            }
        } else {
            if (!notCommon.get("production")) {
                notCommon.error(...arguments);
            }
        }
    }

    static trace() {
        if (!notCommon.get("production")) {
            notCommon.trace(...arguments);
        }
    }

    static trimBackslash(str) {
        if (str.indexOf("/") === 0) {
            str = str.substring(1);
        }
        if (str[str.length - 1] === "/") {
            str = str.substring(0, str.length - 1);
        }
        return str;
    }

    /**
     *  Builds URL with structure like prefix/module/model/id/action
     * If some part absent or set to false it will be excluded from result
     *
     *  @return {string}  url path
     */
    static buildURL({ prefix, module, model, id, action }) {
        let url = ["/"];
        if (prefix) {
            url.push(encodeURIComponent(notCommon.trimBackslash(prefix)));
        }
        if (module) {
            url.push(encodeURIComponent(notCommon.trimBackslash(module)));
        }
        if (model) {
            url.push(encodeURIComponent(notCommon.trimBackslash(model)));
        }
        if (id) {
            url.push(encodeURIComponent(notCommon.trimBackslash(id)));
        }
        if (action) {
            url.push(encodeURIComponent(notCommon.trimBackslash(action)));
        }
        url = url.filter((el) => el !== "");
        return url.join("/").replace(/\/\//g, "/");
    }

    static capitalizeFirstLetter(name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }

    static lowerFirstLetter(string) {
        return string.charAt(0).toLowerCase() + string.slice(1);
    }

    static strLengthCap(str, MAX_TITLE_LENGTH = 50, POST_FIX = "...") {
        if (typeof str === "string" && str.length > MAX_TITLE_LENGTH) {
            return str.substr(0, MAX_TITLE_LENGTH) + POST_FIX;
        } else {
            return str;
        }
    }

    static escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    static startApp(starter) {
        document.addEventListener("DOMContentLoaded", starter);
    }

    static getApp() {
        return notCommon.get("app");
    }

    static extendAppConfig(conf, conf2) {
        return notCommon.deepMerge(conf, conf2);
    }

    static absorbModule() {
        let defaultConf, //app options
            mod, //module options
            targets = {}; //various collections
        if (arguments.length == 1) {
            targets = { ...arguments[0] };
            if (Object.hasOwnProperty.call(arguments[0], "defaultConf")) {
                defaultConf = arguments[0].defaultConf;
                delete targets.defaultConf;
            }
            if (Object.hasOwnProperty.call(arguments[0], "mod")) {
                mod = arguments[0].mod;
                delete targets.mod;
            }
        } else {
            notCommon.log(
                "WARNING: absorbModule format obsoleted, use object {defaultConf, mod, services, uis, wsc, etc}"
            );
            defaultConf = arguments[0];
            mod = arguments[1];
            if (arguments.length > 2) {
                targets.services = arguments[2];
            }
            if (arguments.length > 3) {
                targets.uis = arguments[3];
            }
            if (arguments.length > 4) {
                targets.wcs = arguments[4];
            }
        }
        for (let prop in mod) {
            //add manifest to other
            if (prop === "manifest") {
                defaultConf = notCommon.extendAppConfig(
                    defaultConf,
                    mod.manifest
                );
                continue;
            }
            if (typeof notCommon.get(`absorb.${prop}`) === "function") {
                if (!Object.prototype.hasOwnProperty.call(targets, prop)) {
                    targets[prop] = {};
                    notCommon.log(
                        `WARNING: no accamulator object provided for '${prop}' collection`
                    );
                }
                notCommon.get(`absorb.${prop}`)(targets[prop], mod[prop]);
            } else if (prop.indexOf("nc") === 0) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        defaultConf,
                        "controllers"
                    )
                ) {
                    defaultConf.controllers = {};
                }
                defaultConf.controllers[prop] = mod[prop];
            } else {
                //in case of some other stuff presented, isolating it in special var
                if (!Object.prototype.hasOwnProperty.call(window, "notEnv")) {
                    window.notEnv = {};
                }
                window.notEnv[prop] = mod[prop];
            }
        }
        return defaultConf;
    }

    static defineIfNotExists(obj, key, defaultValue) {
        if (!Object.prototype.hasOwnProperty.call(obj, key)) {
            obj[key] = defaultValue;
        }
    }

    static registry = {};

    static register(key, val) {
        notCommon.registry[key] = val;
    }

    static get(key) {
        return Object.prototype.hasOwnProperty.call(notCommon.registry, key)
            ? notCommon.registry[key]
            : null;
    }

    static moveItem(array, old_index, new_index) {
        if (new_index >= array.length) {
            var k = new_index - array.length;
            while (k-- + 1) {
                array.push(undefined);
            }
        }
        array.splice(new_index, 0, array.splice(old_index, 1)[0]);
    }

    static stripProxy(obj) {
        if (typeof obj !== "undefined" && obj !== null) {
            if (obj.isProxy) {
                if (Array.isArray(obj)) {
                    obj = Array.from(obj);
                } else {
                    obj = Object.assign({}, obj);
                }
                for (let t in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, t)) {
                        obj[t] = notCommon.stripProxy(obj[t]);
                    }
                }
            }
        }
        return obj;
    }

    static pipe(data /* feed data */, funcs /* functions array */) {
        let result;
        for (let func of funcs) {
            result = func(result || data);
        }
        return result;
    }

    static getAPI(type) {
        return notCommon.getManager()
            ? notCommon.getManager().getAPI(type)
            : null;
    }

    static setManager(v) {
        notCommon.MANAGER = v;
    }

    static getManager() {
        return notCommon.MANAGER;
    }

    static getJSON(url) {
        return fetch(url).then((response) => response.json());
    }

    static wait(sec) {
        return new Promise((res) => {
            setTimeout(res, sec * 1000);
        });
    }

    static registerWidgetEvents(events) {
        if (notCommon.getApp()) {
            Object.keys(events).forEach((eventName) => {
                notCommon.getApp().on(eventName, events[eventName]);
            });
        }
    }

    static navigate(url) {
        notCommon.getApp() &&
            notCommon.getApp().getWorking("router").navigate(url);
    }

    static select(variantsSet, value, def) {
        if (
            variantsSet &&
            typeof variantsSet == "object" &&
            Object.hasOwn(variantsSet, value)
        ) {
            return variantsSet[value];
        } else {
            return def;
        }
    }
}

function absorbServices(target, src) {
    if (target) {
        for (let serv in src) {
            if (Object.prototype.hasOwnProperty.call(target, serv)) {
                notCommon.logError(`services property duplication ${serv}`);
            }
            target[serv] = src[serv];
        }
    }
}

function extendWSClient(wcs, wscName, wscOptions) {
    if (!Object.prototype.hasOwnProperty.call(wcs, wscName)) {
        wcs[wscName] = {
            connection: {},
            router: {
                routes: {},
            },
            messenger: {},
        };
    }
    let target = wcs[wscName];
    if (Object.prototype.hasOwnProperty.call(wscOptions, "router")) {
        if (Object.prototype.hasOwnProperty.call(wscOptions.router, "routes")) {
            for (let routeType in wscOptions.router.routes) {
                if (
                    !Object.prototype.hasOwnProperty.call(
                        target.router.routes,
                        routeType
                    )
                ) {
                    target.router.routes[routeType] = {};
                }
                Object.assign(target.router.routes[routeType], {
                    ...wscOptions.router.routes[routeType],
                });
            }
        }
    }
    if (Object.prototype.hasOwnProperty.call(wscOptions, "messenger")) {
        Object.assign(target.messenger, { ...wscOptions.messenger });
    }
    if (Object.prototype.hasOwnProperty.call(wscOptions, "connection")) {
        Object.assign(target.connection, { ...wscOptions.connection });
    }
    for (let t of ["name", "getToken", "logger", "identity", "credentials"]) {
        if (Object.prototype.hasOwnProperty.call(wscOptions, t)) {
            target[t] = wscOptions[t];
        }
    }
}

function absorbWSC(target, src) {
    if (target) {
        for (let wsClientName in src) {
            extendWSClient(target, wsClientName, src[wsClientName]);
        }
    }
}

function absorbUIs(target, src) {
    if (target) {
        for (let ui in src) {
            if (Object.prototype.hasOwnProperty.call(target, ui)) {
                notCommon.logError(`uis property duplication ${ui}`);
            }
            target[ui] = src[ui];
        }
    }
}

function absorbFields(target, src) {
    if (target) {
        for (let ui in src) {
            if (Object.prototype.hasOwnProperty.call(target, ui)) {
                notCommon.logError(`fields property duplication ${ui}`);
            }
            target[ui] = src[ui];
        }
    }
}

notCommon.register("absorb.wsc", absorbWSC);
notCommon.register("absorb.services", absorbServices);
notCommon.register("absorb.uis", absorbUIs);
notCommon.register("absorb.uis", absorbFields);

export default notCommon;
