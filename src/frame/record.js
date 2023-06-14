import notBase from "./base.js";
import notCommon from "./common.js";

import {
    META_INTERFACE,
    META_MAP_TO_INTERFACE,
    DEFAULT_ACTION_PREFIX,
} from "./options";

import notInterface from "./interface";

class notRecord extends notBase {
    constructor(manifest, item) {
        super();
        if (
            typeof item === "undefined" ||
            item === null ||
            typeof item !== "object"
        ) {
            return item;
        }
        if (item && item.isProxy) {
            notCommon.error("this is Proxy item");
            return item;
        }
        if (item && (item.isRecord || item.isProperty)) {
            return item;
        } else {
            if (Array.isArray(item)) {
                return this.createCollection(manifest, item);
            }
        }
        this.setOptions({});
        this[META_INTERFACE] = new notInterface(manifest, {});
        this.setData(item);
        this.interfaceUp();
        this.mapToInterface();
        this.mapToMethods();
        return this;
    }

    mapToInterface() {
        let rec = this;
        for (let t of META_MAP_TO_INTERFACE) {
            if (
                this[META_INTERFACE][t] &&
                typeof this[META_INTERFACE][t] === "function"
            ) {
                this[t] = function () {
                    let res = rec[META_INTERFACE][t](...arguments);
                    return res == rec[META_INTERFACE] ? rec : res;
                };
            }
        }
    }

    mapToMethods() {
        let manifest = this[META_INTERFACE].manifest,
            app = notCommon.getApp(),
            methods = {};
        if (manifest.methods) {
            methods = manifest.methods;
        } else if (app) {
            methods = app.getOptions(
                ["models", this[META_INTERFACE].manifest.model].join("."),
                {}
            );
        }
        if (methods) {
            for (let t in methods) {
                if (Object.prototype.hasOwnProperty.call(methods, t)) {
                    this[t] = methods[t];
                }
            }
        }
    }

    createCollection(manifest, items) {
        var collection = [];
        for (var i = 0; i < items.length; i++) {
            collection.push(new notRecord(manifest, items[i]));
        }
        return collection;
    }

    interfaceUp() {
        if (this[META_INTERFACE].getActionsCount() > 0) {
            let actions = this[META_INTERFACE].getActions();
            for (let i in actions) {
                this.actionUp(i, actions[i]);
            }
        }
    }

    actionUp(index) {
        if (
            !Object.prototype.hasOwnProperty.call(this, [
                DEFAULT_ACTION_PREFIX + index,
            ])
        ) {
            this[DEFAULT_ACTION_PREFIX + index] = (...params) =>
                this[META_INTERFACE].request(this, index, ...params);
        }
    }
    /*
  -> 'path.to.key', valueOfKey
  <- ok, with one onChange event triggered
  */

    setAttr(key, value) {
        return this.setData(key, value);
    }

    /*
  ->
  {
    'keyPath': value,
    'key.subPath': value2,
    'keyPath.0.title': value3
  }
  <- ok, with bunch of onChange events triggered
  */
    setAttrs(objectPart) {
        //notCommon.log('setAttrs', objectPart, Object.keys(objectPart));
        if (
            objectPart &&
            typeof objectPart === "object" &&
            Object.keys(objectPart).length > 0
        ) {
            for (let path in objectPart) {
                //notCommon.log('setAttrs one to go', path);
                this.setAttr(path, objectPart[path]);
            }
        }
    }

    /*
  -> 'pathToKey'
  <- value1
  */
    getAttr(what, plain = false) {
        let prx = this.getData(what, {});
        if (plain) {
            return notCommon.stripProxy(prx);
        } else {
            return prx;
        }
    }

    /*
  -> ['pathToKey', 'path.to.key', 'simpleKey',...]
  <- [value1, value2, value3,...]
  */
    getAttrs(what) {
        let result = [];
        if (what && what.length > 0) {
            for (let path of what) {
                result.push(this.getAttr(path));
            }
        }
        return result;
    }

    getManifest() {
        if (this[META_INTERFACE]) {
            return this[META_INTERFACE].manifest;
        } else {
            return {};
        }
    }

    setItem(item) {
        this.setData(item);
        return this;
    }
}

export default notRecord;
