import Menu from "not-bulma/src/frame/components/navigation/menu.svelte.js";
import UINavbar from "../../../elements/navigation/ui.navbar.svelte";
import UIAdapterSvelte from "not-bulma/src/frame/ui.adapter.svelte.js";

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
 **/

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
        return {
            id: this.getOptions()?.id,
            active: this.getOptions()?.active,
            items: this.menuStructure,
            root: this.getOptions()?.root,
            navigate: this.getOptions()?.navigate,
            brand: this.getOptions()?.brand,
            burger: this.getOptions()?.burger,
            burgerControlsSidemenu: this.getOptions()?.burgerControlsSidemenu,
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
            let props = this.initMenuProps();
            const target = document.querySelector(
                this.getOptions().targetSelector
            );        
            if (!target) {
                return;
            }
            this.menu = new UIAdapterSvelte(UINavbar, target, props, true);            
            this.interval = setInterval(
                this.updateMenuActiveItem.bind(this),
                notTopMenu.INTERVAL_UPDATE_ACTIVE_ITEM
            );
        }
    }

    static updateMenuActiveItem() {        
        this.menu.set('url', this.getCurrentUrl()) ;
    }

    static toggle() {
        this.menu.set('active', !this.menu.get('active'));        
    }

    static hide() {        
        this.menu.set('active', false);
    }

    static show() {        
        this.menu.set('active', true);
    }

    static setBurgerState(menuClosed) {
        this.menu.set('menuClosed', menuClosed);
    }
}

export default notTopMenu;
