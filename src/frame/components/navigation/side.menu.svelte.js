import Menu from "./menu.svelte.js";
import UISideMenu from "./side/ui.side.menu.svelte";
import UIAdapterSvelte from "../../ui.adapter.svelte.js";

const TYPE = "side";

class notSideMenu extends Menu {    

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
        return {
            items: this.menuStructure,
            root: this.getOptions().root,
            navigate: this.getOptions().navigate,
            class: this.getOptions()?.class,
            onclick: this.getOptions()?.onclick,
            url: this.getCurrentUrl(),
        };
    }

    static render(app) {
        if (app) {
            this.setApp(app);
        }
        
        if (!this.menu) {
            this.prepareData();
            let props = this.initMenuUIProps();
            const target = document.querySelector(
                this.getOptions().targetSelector
            );
            if (!target) {
                return;
            }
            this.menu = new UIAdapterSvelte(UISideMenu, target, props, true);            
            this.initSizeResponse();
            this.interval = setInterval(
                this.updateMenuActiveItem.bind(this),
                notSideMenu.INTERVAL_UPDATE_ACTIVE_ITEM
            );
        }
    }

    static update() {
        if (this.menu) {
            this.menu.destroy();
            this.createUI(this.initMenuUIProps());
        }
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
        this.resizeAsideAndMain();
        this.resizeMain();
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
        if (!this.menu) return;
        if (this.isTouch()) {
            if (this.menu.get('open')) {
                this.main.style.display = "none";
            } else {
                this.main.style.display = "block";
                this.main.style.marginLeft = "0px";
            }
        } else {
            const rect = this.aside.getBoundingClientRect();
            this.main.style.display = "block";
            if (this.main.style.height === "0px") {
                this.main.style.height = "auto";
            }
            this.main.style.marginLeft = rect.width + rect.left + "px";
        }
    }

    static resizeAside() {
        if (!this.menu) return;
        if (this.aside.style.display !== "none") {
            const rect = this.nav.getBoundingClientRect();
            this.menu.set('height',  window.innerHeight - rect.height + "px)");
            this.menu.set('marginTop',  rect.height + "px");
        }
    }

    static resizeAsideAndMain() {
        if (!this.menu) return;
        let rect = this.nav.getBoundingClientRect();
        this.menu.set('height', window.innerHeight - rect.height + "px");
        //this.aside.style.paddingTop = (rect.height) + 'px';
        //this.main.style.marginTop = (rect.height) + 'px';
    }

    static bindToggle() {
        const els = document.querySelectorAll(this.getOptions().toggleSelector);
        Array.from(els).forEach((el) => {
            el.removeEventListener("click", this.toggle.bind(this));
            el.addEventListener("click", this.toggle.bind(this));
        });
    }

    static toggle(e) {
        e && e.preventDefault();
        if (this.isTouch()) {
            this.menu.set('open', true);            
        } else {
            this.menu.set('open', false);            
        }
        this.resizeMain();
        return false;
    }

    static hide(e) {
        e && e.preventDefault();
        
            if (this.isTouch()) {
                this.menu.set('open', true);            
            } else {
                this.menu.set('open', false);            
            }
            this.resizeMain();
        
        
        return false;
    }

    static show(e) {
        e && e.preventDefault();        
            if (this.isTouch()) {
                this.menu.set('open', true);            
            } else {
                this.menu.set('open', false);            
            }
            this.resizeMain();
                
        return false;
    }

    static isOpen() {
        if (this.menu) {return this.menu.get('open', true);}
        return false;
    }
}

export default notSideMenu;
