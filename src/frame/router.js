import notBase from "./base.js";

import { NAVIGATION_DELAYS, NAVIGATION_DELAY_DEFAULT } from "./const.js";

const OPT_MODE_HISTORY = Symbol("history"),
    OPT_MODE_HASH = Symbol("hash"),
    OPT_DEFAULT_CHECK_INTERVAL = 50;

class notRouter extends notBase {
    host = "";
    constructor() {
        super({
            working: {
                routes: [],
                mode: OPT_MODE_HISTORY,
                root: "/", //always in slashes /user/, /, /input/. and no /user or input/level
                initialized: false,
                delays: NAVIGATION_DELAYS,
                delay_default: NAVIGATION_DELAY_DEFAULT,
            },
        });
        return this;
    }

    /**
     * Set object with named delays
     * @param {Object.<string, number>} delays
     * @returns {notRouter}
     */
    setDelays(delays) {
        this.setWorking("delays", delays);
        return this;
    }

    /**
     * Set default navigation delay, provided as name of one of `delays` or in number form
     * @param {string|number} delay
     * @returns {notRouter}
     */
    setDefaultNavigationDelay(delay) {
        this.setWorking("delay_default", this.delayAsMs(delay));
        return this;
    }

    /**
     * Returns number of ms, if not set returns NAVIGATION_DELAY_DEFAULT
     * @returns {number}
     */
    getDefaultNavigationDelay() {
        return this.getWorking(`delay_default`, NAVIGATION_DELAY_DEFAULT);
    }

    /**
     *  Ensures that delay is in ms, if its provided as name of alias, searches for it and returns, if not found - returns working default_delay
     * @param {string|number} delay    name of delay alias or number of ms
     * @returns {number}               delay in ms
     */
    delayAsMs(delay) {
        if (typeof delay === "number") {
            return delay;
        } else {
            if (typeof delay === "string" && delay.length > 0) {
                return this.getWorking(
                    `delays.${delay}`,
                    this.getDefaultNavigationDelay()
                );
            } else {
                return this.getDefaultNavigationDelay();
            }
        }
    }

    /**
     *
     *  @param {string}              url     we go to url
     *  @param {string|number}       delay   name of delay alias or number of ms
     *  @returns {NodeJS.Timeout}            timeout identificator
     */
    navigateWithDelay(url, delay) {
        return setTimeout(() => this.navigate(url), this.delayAsMs(delay));
    }

    /**
     * Use browser History API
     */
    history() {
        this.setWorking("mode", OPT_MODE_HISTORY);
    }

    /**
     * Use hash part as container for location information
     */
    hash() {
        this.setWorking("mode", OPT_MODE_HASH);
    }

    /**
     * root should start and end with
     * @param {string} root
     * @returns {notRouter}
     */
    setRoot(root) {
        this.setWorking(
            "root",
            root && root !== "/" ? "/" + this.clearSlashes(root) + "/" : "/"
        );
        return this;
    }

    /**
     * clear first and last slashes from string
     * @param {string} path
     * @returns {string}
     */
    clearSlashes(path) {
        return path.toString().replace(/\/$/, "").replace(/^\//, "");
    }

    add(re, handler) {
        if (typeof re == "function") {
            handler = re;
            re = "";
        }
        let rule = {
            re: re,
            handler: handler,
        };
        this.getWorking("routes").push(rule);
        return this;
    }

    addList(list) {
        for (let t in list) {
            this.add(t, list[t]);
        }
        return this;
    }

    remove(param) {
        for (
            var i = 0, r;
            i < this.getWorking("routes").length,
                (r = this.getWorking("routes")[i]);
            i++
        ) {
            if (r.handler === param || r.re === param) {
                this.getWorking("routes").splice(i, 1);
                return this;
            }
        }
        return this;
    }

    flush() {
        this.setWorking({
            routes: [],
            mode: OPT_MODE_HISTORY,
            root: "/",
        });
        return this;
    }

    isInitialized() {
        return this.getWorking("initialized");
    }

    setInitialized(val = true) {
        return this.setWorking("initialized", val);
    }

    getFragment() {
        var fragment = "";
        if (this.getWorking("mode") === OPT_MODE_HISTORY) {
            if (!location) return "";
            fragment = this.clearSlashes(
                decodeURI(location.pathname + location.search)
            );
            fragment = fragment.replace(/\?(.*)$/, "");
            fragment =
                this.getWorking("root") != "/"
                    ? fragment.replace(this.getWorking("root"), "")
                    : fragment;
        } else {
            if (!window) return "";
            var match = window.location.href.match(/#(.*)$/);
            fragment = match ? match[1] : "";
        }
        return this.clearSlashes(fragment);
    }

    checkLocation() {
        let current = this.getWorking("current"),
            fragment = this.getFragment(),
            init = this.isInitialized();
        if (current !== fragment || !init) {
            this.setWorking("current", fragment);
            this.check(fragment);
            this.setInitialized(true);
        }
    }

    hrefClick() {
        //console.log(...arguments);
    }

    getRoot() {
        return this.getWorking("root");
    }

    listen(loopInterval = OPT_DEFAULT_CHECK_INTERVAL) {
        this.setWorking("current", "notInitialized");
        clearInterval(this.getWorking("interval"));
        this.setWorking(
            "interval",
            setInterval(this.checkLocation.bind(this), loopInterval)
        );
        window.addEventListener("popstate", this.hrefClick.bind(this));
        return this;
    }

    check(f) {
        let fragment = f || this.getFragment(),
            failBack = null;
        for (let i = 0; i < this.getWorking("routes").length; i++) {
            let path =
                    this.getWorking("root") + this.getWorking("routes")[i].re,
                fullRE = this.clearSlashes(decodeURI(path)),
                match = fragment.match(fullRE);
            if (match && match.length) {
                if (fullRE === "") {
                    match.shift();
                    failBack = {
                        route: this.getWorking("routes")[i],
                        match,
                    };
                } else {
                    match.shift();
                    this.getWorking("routes")[i].handler.apply(
                        this.host || {},
                        match
                    );
                    this.emit("afterRoute", this.getWorking("routes")[i]);
                    return this;
                }
            }
        }
        if (failBack) {
            failBack.route.handler.apply(this.host || {}, failBack.match);
            this.emit("afterRoute", failBack.route);
        }
        return this;
    }

    /**
     *  Refreshes page
     * @param {number} timeout time to wait in ms
     */
    refresh(timeout = 0) {
        if (timeout > 0) {
            setTimeout(() => this.refresh(), timeout);
        } else {
            this.check(this.getWorking("current"));
        }
    }

    /**
     * Changes locations
     * @param {string} path
     * @returns
     */
    navigate(path) {
        path = path ? path : "";
        switch (this.getWorking("mode")) {
            case OPT_MODE_HISTORY: {
                const newRoute = this.getFullRoute(path);
                if (newRoute === this.lastRoute) {
                    this.refresh();
                } else {
                    this.lastRoute = newRoute;
                    history.pushState(null, "", this.lastRoute);
                }
                break;
            }
            case OPT_MODE_HASH: {
                window.location.href.match(/#(.*)$/);
                window.location.href =
                    window.location.href.replace(/#(.*)$/, "") + "#" + path;
                break;
            }
        }
        return this;
    }

    /**
     *  returns app root + path
     * @param {string} path
     * @returns {string}
     */
    getFullRoute(path = "") {
        path = this.clearSlashes(path);
        const root = this.getWorking("root");
        if (root !== "/") {
            if (path.indexOf(root.substring(1)) === 0) {
                return "/" + path;
            }
        }
        return this.getWorking("root") + this.clearSlashes(path);
    }

    /**
     * Returns all links with n-href attribute
     * @returns {Array<HTMLAnchorElement>}
     */
    getAllLinks() {
        const allElements = document.body.querySelectorAll("a");
        let list = [];
        for (let j = 0; j < allElements.length; j++) {
            for (
                let i = 0, atts = allElements[j].attributes, n = atts.length;
                i < n;
                i++
            ) {
                if (atts[i].nodeName.indexOf("n-href") === 0) {
                    list.push(allElements[j]);
                    break;
                }
            }
        }
        return list;
    }

    /**
     * Reroute all links(anchor tags) with n-href attribute.
     * Disable navigation to href.
     * @returns {notRouter}
     */
    reRouteExisted() {
        const list = this.getAllLinks();
        for (let t = 0; t < list.length; t++) {
            this.initRerouting(list[t], list[t].getAttribute("n-href"));
        }
        return this;
    }

    /**
     * If `el` is not initialized, adds onclick listener to navigate to `link` location.
     * Disables default navigation to href.
     * @param {HTMLAnchorElement}   el
     * @param {string}              link
     * @returns
     */
    initRerouting(el, link) {
        // @ts-ignore
        if (!el.notRouterInitialized) {
            let fullLink = this.getFullRoute(link);
            el.setAttribute("href", fullLink);
            el.addEventListener("click", (e) => {
                e.preventDefault();
                this.navigate(link);
                return false;
            });
            // @ts-ignore
            el.notRouterInitialized = true;
        }
        return this;
    }
}

export default new notRouter();
