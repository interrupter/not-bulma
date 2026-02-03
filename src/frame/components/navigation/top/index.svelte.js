import Menu from "../menu.js";
import UINavbar from "../../../../elements/navigation/ui.navbar.svelte";
import { mount } from "svelte";

const TYPE = "top";

/** @typedef MenuProperties
 *  @prop   {string}    id
 *  @prop   {boolean}   active
 *  @prop   {Array<object>}    items
 *  @prop   {string}    root
 *  @prop   {function}  navigate
 *  @prop   {object}    brand
 *  @prop   {boolean}   burger
 *  @prop   {boolean}   burgerControlsSidemenu
 *  @prop   {string}    class
 *  @prop   {function}  onclick
 *  
*/

/** @type {MenuProperties} */
const MENU_PROPS = $state({});

class notTopMenu extends Menu {
    static DEFAULT = {
        section: "any",
        sectionTitle: "Меню",
        priority: 0,
        //link, button, dropdown, component
        type: "link",
        place: "main",
    };

    static options = {
        brand: false,
        type: TYPE,
        items: [],
        sections: [],
        targetSelector: `#${TYPE}-menu`,
        root: "/",
        directNavigation: false,
        navigate: (urls) => {
            this.hide();
            if (!this.isDirectNavigation() && this.app) {
                let func = this.app.getWorking("router");
                if (func) {
                    return func.navigate(urls.short);
                }
            }
            document.location.assign(urls.full);
        },
    };

    static initMenuProps() {
        MENU_PROPS.id = this.getOptions()?.id; 
        MENU_PROPS.active = this.getOptions()?.active; 
        MENU_PROPS.items = this.items;        
        MENU_PROPS.root = this.getOptions()?.root;
        MENU_PROPS.navigate: this.getOptions()?.navigate;
        MENU_PROPS.brand = this.getOptions()?.brand; 
        MENU_PROPS.burger = this.getOptions()?.burger;        
        MENU_PROPS.burgerControlsSidemenu = this.getOptions()?.burgerControlsSidemenu;
        MENU_PROPS.class = this.getOptions()?.class;
        MENU_PROPS.onclick = this.getOptions()?.onclick;
    }

    static render(app) {
        if (app) {
            this.setApp(app);
        }
        this.prepareData();
        if (!this.menu) {
            this.initMenuProps();
            const target = document.querySelector(
                this.getOptions().targetSelector
            );
            if (!target) {
                return;
            }
            const frag = document.createDocumentFragment();
            this.menu = mount(UINavbar, {
                target: frag,
                props: MENU_PROPS,
            });
            target.replaceWith(frag);
            this.interval = setInterval(
                this.updateMenuActiveItem.bind(this),
                notTopMenu.INTERVAL_UPDATE_ACTIVE_ITEM
            );
        }
    }

    static updateMenu(url) {
        Array.from(
            document.querySelectorAll(
                this.getOptions().targetSelector + " aside.menu a"
            )
        ).forEach((item) => {
            if (
                item.href == url ||
                (url.href && url.href.indexOf(item.href) == 0)
            ) {
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
                this.updateMenu(url);
            }
        } else {
            this.location = url;
            this.updateMenu(url);
        }
    }

    static toggle() {
        let el = document.querySelector(this.getOptions().targetSelector);
        el.classList.toggle("is-active");
    }

    static hide() {
        let el = document.querySelector(this.getOptions().targetSelector);
        el.classList.remove("is-active");
    }

    static show() {
        let el = document.querySelector(this.getOptions().targetSelector);
        el.classList.add("is-active");
    }

    static setBurgerState(menuClosed) {
        MENU_PROPS.menuClosed = menuClosed;
    }
}

export default notTopMenu;
