import EventEmitter from "wolfy87-eventemitter";
import notPath from "not-path";

import notCommon from "./common.js";

const META_METHOD_INIT = Symbol("init"),
    META_DATA = Symbol("data"),
    META_WORKING = Symbol("working"),
    META_OPTIONS = Symbol("options");

export default class notBase extends EventEmitter {
    constructor(input) {
        super();
        this[META_DATA] = {};
        this[META_WORKING] = {};
        this[META_OPTIONS] = {};
        this[META_METHOD_INIT](input);
        return this;
    }

    [META_METHOD_INIT](input) {
        if (!input) {
            input = {};
        }

        // @ts-ignore
        if (Object.hasOwn(input, "data")) {
            this.setData(input.data);
        }

        // @ts-ignore
        if (Object.hasOwn(input, "working")) {
            this.setWorking(input.working);
        }

        // @ts-ignore
        if (Object.hasOwn(input, "options")) {
            this.setOptions(input.options);
        }

        this.log = notCommon.genLogMsg(this.getWorking("name"));
        this.info = this.log;
        this.debug = notCommon.genLogDebug(this.getWorking("name"));
        this.error = notCommon.genLogError(this.getWorking("name"));
    }

    setCommon(what, args) {
        switch (args.length) {
            case 1: {
                /* set collection */
                what = args[0];
                break;
            }
            case 2: {
                /* set collection element */
                notPath.set(
                    args[0] /* path */,
                    what /* collection */,
                    undefined /* helpers */,
                    args[1] /* value */
                );
                break;
            }
        }
        return this;
    }
    getCommon(what, args) {
        switch (args.length) {
            /* if we want get data by path */
            case 1: {
                return notPath.get(args[0], what);
            }
            /* if we want get data by path with default value */
            case 2: {
                let res = notPath.get(args[0], what);
                if (res === undefined) {
                    /* no data, return default value */
                    return args[1];
                } else {
                    /* data, return it */
                    return res;
                }
            }
            /* return full collection */
            default: {
                return what;
            }
        }
    }

    /*
    CORE OBJECT
      DATA - information
      OPTIONS - how to work
      WORKING - temporarily generated in proccess
  */

    setData() {
        if (arguments.length === 1) {
            this[META_DATA] = arguments[0];
        } else {
            this.setCommon(this.getData(), arguments);
        }
        this.emit("onchange");
        return this;
    }

    getData() {
        return this.getCommon(this[META_DATA], arguments);
    }

    setOptions() {
        if (arguments.length === 1) {
            this[META_OPTIONS] = arguments[0];
        } else {
            this.setCommon(this.getOptions(), arguments);
        }
        return this;
    }

    getOptions() {
        return this.getCommon(this[META_OPTIONS], arguments);
    }

    setWorking() {
        if (arguments.length === 1) {
            this[META_WORKING] = arguments[0];
        } else {
            this.setCommon(this.getWorking(), arguments);
        }
        return this;
    }

    getWorking() {
        return this.getCommon(this[META_WORKING], arguments);
    }

    report(e) {
        if (notCommon.report) {
            notCommon.report(e);
        }
    }

    getApp() {
        return notCommon.getApp();
    }

    destroy() {
        this.removeEvent();
        this.setOptions(null);
        this.setWorking(null);
        this.setData(null);
        this.emit("ondestroy");
    }
}
