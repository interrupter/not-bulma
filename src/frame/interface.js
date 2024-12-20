import notPath from "not-path";
import notCommon from "./common.js";
import notBase from "./base.js";

const OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY = ["_id", "id", "ID"],
    DEFAULT_FILTER = {},
    DEFAULT_SEARCH = "",
    DEFAULT_RETURN = {},
    DEFAULT_PAGE_NUMBER = 0,
    DEFAULT_PAGE_SIZE = 10,
    DEFAULT_ACTION_PREFIX = "$",
    DEFAULT_WS_ROUTE_ACTION_SPLITTER = "//";

class notInterface extends notBase {
    constructor(manifest, options) {
        super({
            working: {
                name:
                    "network interface for: " +
                    (manifest.model ? manifest.model : "unknown"),
                filter: DEFAULT_FILTER,
                search: DEFAULT_SEARCH,
                return: DEFAULT_RETURN,
                pager: {
                    size: DEFAULT_PAGE_SIZE,
                    page: DEFAULT_PAGE_NUMBER,
                },
            },
            options,
        });
        this.manifest = manifest;
        this.initActions();
        return this;
    }

    initActions() {
        if (this.getActionsCount() > 0) {
            let actions = this.getActions();
            for (let actionName in actions) {
                this.initAction(actionName);
            }
        }
    }

    initAction(actionName) {
        if (!notCommon.objHas(this, DEFAULT_ACTION_PREFIX + actionName)) {
            this[DEFAULT_ACTION_PREFIX + actionName] = (
                opts,
                headers,
                fileUpload = false,
                files
            ) =>
                this.request(
                    this,
                    actionName,
                    opts,
                    headers,
                    fileUpload,
                    files
                );
        }
    }

    requestHTTP(
        record,
        actionName,
        params,
        headers = {},
        fileUpload = false,
        files
    ) {
        try {
            let compositeData = Object.assign(
                {},
                record.getData && typeof record.getData === "function"
                    ? record.getData()
                    : record,
                params
            );
            let actionData = this.getActionData(actionName),
                requestParams = this.collectRequestData(actionData),
                requestParamsEncoded = this.encodeRequest(requestParams),
                //id = this.getID(compositeData, actionData, actionName),
                apiServerURL = this.getServerURL(),
                url = this.getURL(compositeData, actionData, actionName),
                opts = {};
            if (fileUpload) {
                url = this.getURL(params, actionData, actionName);
                const fd = new FormData();
                fd.append("file", files);
                opts.body = fd;
            } else {
                if (
                    ["OPTIONS", "GET"].indexOf(
                        actionData.method.toUpperCase()
                    ) === -1
                ) {
                    opts = {
                        method: actionData.method,
                        body: JSON.stringify(
                            record.getData &&
                                typeof record.getData === "function"
                                ? record.getData()
                                : record
                        ),
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/json",
                        },
                    };
                }
            }
            opts.method = actionData.method.toUpperCase();
            if (headers && Object.keys(headers).length) {
                opts.headers = headers;
            }
            return fetch(apiServerURL + url + requestParamsEncoded, opts).then(
                (response) => response.json()
            );
        } catch (e) {
            notCommon.error(e);
            notCommon.report(e);
        }
    }

    requestWS(record, actionName) {
        try {
            let actionData = this.getActionData(actionName),
                requestParams = this.collectRequestData(actionData);
            const WS = notCommon.getApp().getWSClient();
            const messageName = this.getWSRequestName(actionName);
            const payload = Object.assign({}, requestParams, record.getData());
            if (
                notCommon.objHas(actionData, "type") &&
                typeof actionData.type === "string" &&
                actionData.type.length &&
                actionData.type !== "request"
            ) {
                return WS.message(actionData.type, messageName, payload).then(
                    (response) => response.payload
                );
            } else {
                return WS.request(messageName, payload).then(
                    (response) => response.payload
                );
            }
        } catch (e) {
            notCommon.error(e);
            notCommon.report(e);
        }
    }

    request() {
        let actionData = this.getActionData(arguments[1]);
        switch (this.selectTransport(actionData)) {
            case "ws":
                return this.requestWS(...arguments);
            case "http":
                return this.requestHTTP(...arguments);
            default:
                throw new Error("Offline");
        }
    }

    wsIsUp(actionData) {
        if (actionData.ws === true) {
            let client;
            if (
                notCommon.objHas(actionData, "wsClient") &&
                actionData.wsClient
            ) {
                client = notCommon.getApp().getWSClient(actionData.wsClient);
            } else {
                client = notCommon.getApp().getWSClient();
            }
            if (client) {
                return true;
            }
        }
        return false;
    }

    selectTransport(actionData) {
        if (this.wsIsUp(actionData)) {
            return "ws"; //for ws/wss
        }
        if (notCommon.objHas(actionData, "method")) {
            return "http"; //for http/https
        }
        return false; //for offline
    }

    getModelName() {
        return this && this.manifest ? this.manifest.model : null;
    }

    getActionData(actionName) {
        return this.getActions() && this.getActions()[actionName]
            ? this.getActions()[actionName]
            : null;
    }

    getActionsCount() {
        return this.getActions() ? Object.keys(this.getActions()).length : 0;
    }

    getActions() {
        return this.manifest && this.manifest.actions
            ? this.manifest.actions
            : {};
    }

    parseParams(start, end, line, record) {
        let fieldName = "";
        let len = start.length;
        while (line.indexOf(start) > -1) {
            let ind = line.indexOf(start);
            let startSlice = ind + len;
            let endSlice = line.indexOf(end);
            if (ind > endSlice) {
                break;
            }
            fieldName = line.slice(startSlice, endSlice);
            if (fieldName == "") break;
            this.log &&
                this.log(
                    start + fieldName + end,
                    notPath.get(fieldName, record)
                );
            line = line.replace(
                start + fieldName + end,
                notPath.get(fieldName, record)
            );
        }
        return line;
    }

    parseLine(line, record, actionName) {
        line = line.replace(":modelName", this.manifest.model);
        line = line.replace(":actionName", actionName);
        line = this.parseParams(":record[", "]", line, record);
        line = this.parseParams(":", "?", line, record);
        return line;
    }

    getURL(record, actionData, actionName) {
        var line =
            this.parseLine(this.manifest.url, record, actionName) +
            (notCommon.objHas(actionData, "postFix")
                ? this.parseLine(actionData.postFix, record, actionName)
                : "");
        return line;
    }

    getServerURL() {
        return notCommon.getApp()
            ? notCommon.getApp().getOptions("api.server.url", "")
            : "";
    }

    getWSRequestName(actionName) {
        const modelName = this.manifest.model;
        return `${modelName}${DEFAULT_WS_ROUTE_ACTION_SPLITTER}${actionName}`;
    }

    encodeRequest(data) {
        let p = "?";
        for (let t in data) {
            if (typeof data[t] !== "undefined" && data[t] !== null) {
                p +=
                    encodeURIComponent(t) +
                    "=" +
                    encodeURIComponent(
                        data[t].constructor === Object
                            ? JSON.stringify(data[t])
                            : data[t]
                    ) +
                    "&";
            }
        }
        //for test purpose only, special test server needed
        if (this.getOptions("test")) {
            p += "&test=1";
            if (this.getOptions("test.session")) {
                p += "&session=" + this.getOptions("test.session");
            }
            if (this.getOptions("test.session")) {
                p += "&role=" + this.getOptions("test.role");
            }
        }
        return p;
    }

    collectRequestData(actionData) {
        let requestData = {};
        if (
            notCommon.objHas(actionData, "data") &&
            Array.isArray(actionData.data)
        ) {
            for (let i = 0; i < actionData.data.length; i++) {
                let dataProviderName =
                    "get" + notCommon.capitalizeFirstLetter(actionData.data[i]);
                if (
                    this[dataProviderName] &&
                    typeof this[dataProviderName] === "function"
                ) {
                    let data = this[dataProviderName](),
                        res = {};
                    if (
                        [
                            "pager",
                            "sorter",
                            "filter",
                            "search",
                            "return",
                        ].indexOf(actionData.data[i]) > -1
                    ) {
                        res[actionData.data[i]] = data;
                    } else {
                        res = data;
                    }
                    requestData = Object.assign(requestData, res);
                }
            }
        }
        return requestData;
    }

    getID(record, actionData) {
        let resultId,
            list = OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY,
            prefixes = ["", this.manifest.model];
        if (notCommon.objHas(actionData, "index") && actionData.index) {
            list = [actionData.index].concat(
                OPT_DEFAULT_INDEX_FIELD_NAME_PRIORITY
            );
        }
        for (let pre of prefixes) {
            for (let t of list) {
                if (notCommon.objHas(record, pre + t)) {
                    resultId = record[pre + t];
                    break;
                }
            }
        }
        return resultId;
    }

    setFindBy(key, value) {
        var obj = {};
        obj[key] = value;
        return this.setFilter(obj);
    }

    setFilter(filterData = DEFAULT_FILTER) {
        this.setWorking("filter", filterData);
        return this;
    }

    resetFilter() {
        return this.setFilter();
    }

    getFilter() {
        return this.getWorking("filter");
    }

    setSearch(searchData = DEFAULT_SEARCH) {
        this.setWorking("search", searchData);
        return this;
    }

    resetSearch() {
        return this.setSearch();
    }

    getSearch() {
        return this.getWorking("search");
    }

    setSorter(sorterData) {
        this.setWorking("sorter", sorterData);
        return this;
    }

    resetSorter() {
        return this.setSorter({});
    }

    getSorter() {
        return this.getWorking("sorter");
    }

    setReturn(returnData = DEFAULT_RETURN) {
        this.setWorking("return", returnData);
        return this;
    }

    resetReturn() {
        return this.setReturn({});
    }

    getReturn() {
        return this.getWorking("return");
    }

    setPageNumber(pageNumber) {
        this.setWorking("pager.page", pageNumber);
        return this;
    }

    setPageSize(pageSize) {
        this.setWorking("pager.size", pageSize);
        return this;
    }

    //pageSize = DEFAULT_PAGE_SIZE, pageNumber = DEFAULT_PAGE_NUMBER
    setPager() {
        if (
            (arguments.length < 2 ||
                isNaN(arguments[0]) ||
                isNaN(arguments[1])) &&
            arguments[0].constructor === Object &&
            notCommon.objHas(arguments[0], "page") &&
            notCommon.objHas(arguments[0], "size")
        ) {
            const pager = arguments[0];
            this.setWorking("pager", {
                size: pager.size || DEFAULT_PAGE_SIZE,
                page: pager.page || DEFAULT_PAGE_NUMBER,
            });
        } else if (
            arguments.length === 2 &&
            !isNaN(arguments[0]) &&
            !isNaN(arguments[1])
        ) {
            this.setWorking("pager", {
                size: arguments[0] || DEFAULT_PAGE_SIZE,
                page: arguments[1] || DEFAULT_PAGE_NUMBER,
            });
        }
        return this;
    }

    resetPager() {
        return this.setPager();
    }

    getPager() {
        return this.getWorking("pager");
    }

    getRecord() {
        this.getData();
    }

    getDefaultAsPlainObject() {
        if (!this.manifest || !this.manifest.fields) {
            return {};
        }
        const result = {};
        for (const fieldName of Object.keys(this.manifest.fields)) {
            if (Object.hasOwn(this.manifest.fields[fieldName], "default")) {
                const defaultValue = this.manifest.fields[fieldName].default;
                if (Array.isArray(defaultValue)) {
                    result[fieldName] = [...defaultValue];
                } else if (typeof defaultValue === "object") {
                    result[fieldName] = { ...defaultValue };
                } else {
                    result[fieldName] = defaultValue;
                }
            }
        }
        return result;
    }
}

export default notInterface;
