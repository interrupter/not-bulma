import Menu from "../menu.js";
import UISideMenu from "./ui.side.menu.svelte";

import SideMenuState from "./store.js";
import { mount, unmount } from "svelte";

const TYPE = "side";

let MENU_UI_PROPS = $state({});

class notSideMenu extends Menu {
    static nav;
    static main;
    static aside;

    static DEFAULT = {
        section: "any",
        sectionTitle: "Меню",
        priority: 0,
        open: true,
        type: "link",
    };

    static options = {
        directNavigation: false,
        type: TYPE,
        items: [],
        sections: [],
        targetSelector: `#${TYPE}-menu`,
        toggleSelector: `.${TYPE}-menu-toggle`,
        root: "/",
        open: true,
        navigate: (urls) => {
            if (this.isTouch()) {
                this.hide();
                this.app &&
                    this.app.emit("top-navbar-burger:update", { closed: true });
            }
            if (!this.isDirectNavigation() && this.app) {
                let func = this.app.getWorking("router");
                if (func) {
                    return func.navigate(urls.short);
                }
            }
            document.location.assign(urls.full);
        },
    };

    static initMenuUIProps() {
        MENU_UI_PROPS = {
            items: this.items,
            sections: this.sections,
            root: this.getOptions().root,
            navigate: this.getOptions().navigate,
        };
    }

    static render(app) {
        if (app) {
            this.setApp(app);
        }
        this.prepareData();
        if (!this.menu) {
            this.initMenuUIProps();
            this.createUI();
        }
    }

    static update() {
        if (this.menu) {
            unmount(this.menu);
            this.createUI();
        }
    }

    static createUI() {
        let target = document.querySelector(this.getOptions().targetSelector);
        if (!target) {
            return;
        }
        this.menu = mount(UISideMenu, {
            target,
            props: MENU_UI_PROPS,
        });
        this.initSizeResponse();

        this.interval = setInterval(
            this.updateMenuActiveItem.bind(this),
            this.INTERVAL_UPDATE_ACTIVE_ITEM
        );
        this.bindToggle();
    }

    static itemIsActive(itemURL) {
        return (this.location + "/").indexOf(itemURL + "/") > -1;
    }

    static updateMenu() {
        Array.from(
            document.querySelectorAll(this.getOptions().targetSelector + " a")
        ).forEach((item) => {
            if (this.itemIsActive(item.getAttribute("href"))) {
                item.classList.add("is-active");
            } else {
                item.classList.remove("is-active");
            }
        });
    }

    static updateMenuActiveItem() {
        let url = window.location.toString(),
            lastLocation = this.location;
        if (lastLocation) {
            if (url !== lastLocation) {
                this.location = url;
                this.updateMenu();
            }
        } else {
            this.location = url;
            this.updateMenu();
        }
    }

    static initSizeResponse() {
        this.nav = document.querySelector("nav.navbar");
        this.aside = document.querySelector("aside");
        this.main = document.querySelector("main");
        this.resizeAsideAndMain(this.aside, this.main, this.nav);
        this.resizeMain(this.main, this.aside);
        window.addEventListener("resize", this.resizeMain.bind(this));
        if (this.isTouch()) {
            if (this.getOptions().open) {
                this.show();
            } else {
                this.hide();
            }
        }
    }

    static resizeMain() {
        if (this.isTouch()) {
            if (this.aside.classList.contains("is-active")) {
                this.main.style.display = "none";
            } else {
                this.main.style.display = "block";
                this.main.style.marginLeft = "0px";
            }
        } else {
            let rect = this.aside.getBoundingClientRect();
            this.main.style.display = "block";
            if (this.main.style.height === "0px") {
                this.main.style.height = "auto";
            }
            this.main.style.marginLeft = rect.width + rect.left + "px";
        }
    }

    static resizeAside() {
        if (this.aside.style.display !== "none") {
            let rect = this.nav.getBoundingClientRect();
            this.aside.style.height = window.innerHeight - rect.height + "px";
            this.aside.style.marginTop = rect.height + "px";
        }
    }

    static resizeAsideAndMain() {
        let rect = this.nav.getBoundingClientRect();
        this.aside.style.height = window.innerHeight - rect.height + "px";
        //this.aside.style.paddingTop = (rect.height) + 'px';
        //this.main.style.marginTop = (rect.height) + 'px';
    }

    static bindToggle() {
        let els = document.querySelectorAll(this.getOptions().toggleSelector);
        Array.from(els).forEach((el) => {
            el.removeEventListener("click", this.toggle.bind(this));
            el.addEventListener("click", this.toggle.bind(this));
        });
    }

    static toggle(e) {
        e && e.preventDefault();
        if (this.aside) {
            if (this.isTouch()) {
                this.aside.classList.toggle("is-active");
            } else {
                this.aside.classList.toggle("is-closed");
            }
            this.resizeMain();
        }
        return false;
    }

    static hide(e) {
        e && e.preventDefault();
        if (this.aside) {
            if (this.isTouch()) {
                this.aside.classList.remove("is-active");
            } else {
                this.aside.classList.add("is-closed");
            }
            this.resizeMain();
        }
        SideMenuState.update((val) => {
            val.open = false;
            return val;
        });
        return false;
    }

    static show(e) {
        e && e.preventDefault();
        if (this.aside) {
            if (this.isTouch()) {
                this.aside.classList.add("is-active");
            } else {
                this.aside.classList.remove("is-closed");
            }
            this.resizeMain();
        }
        SideMenuState.update((val) => {
            val.open = true;
            return val;
        });
        return false;
    }

    static isOpen() {
        if (this.aside) {
            if (this.isTouch()) {
                return this.aside.classList.contains("is-active");
            } else {
                return !this.aside.classList.contains("is-closed");
            }
        } else {
            return true;
        }
    }
}

export default notSideMenu;
