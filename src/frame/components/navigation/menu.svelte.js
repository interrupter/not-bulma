import { COMPONENTS } from "not-bulma/src/frame/LIB.js";
import UICommon from "not-bulma/src/elements/common.js";



class Menu {
    static MAX_TOUCH_WIDTH = 1023;

    static DEFAULT = {
        section: "any",
        sectionTitle: "Меню",
        priority: 0,
        //link, button, dropdown, component
        type: "link",
        open: false,
    };
    static app = false;
    static directNavigation = false;
    static menu;

    static options = {
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

    static items = [];
    static sections = [];
    static menuStructure = [];
    
    static location;
    static interval;

    static setApp(app) {
        if (!this.app) {
            this.app = app;
        }
        return this;
    }

    static setOptions(options) {
        this.options = { ...this.options, ...options };
        return this;
    }

    static getOptionsPathTo(what) {
        return `menu.${this.options.type}.${what}`;
    }

    static getCurrentUrl(){
        return window.location.toString();
    }

    static isDirectNavigation() {
        return this.app
            ? this.app.getOptions(
                  this.getOptionsPathTo("directNavigation"),
                  this.options.directNavigation
              )
            : this.options.directNavigation;
    }

    static getOptions() {
        if (this.app) {
            return {                
                class: this.app.getOptions(this.getOptionsPathTo("class"), this.options.class),
                brand: this.app.getOptions("brand", this.options.brand),
                items: this.app.getOptions(
                    this.getOptionsPathTo("items"),
                    this.options.items
                ),
                sections: this.app.getOptions(
                    this.getOptionsPathTo("sections"),
                    this.options.sections
                ),
                targetSelector: this.app.getOptions(
                    this.getOptionsPathTo("targetSelector"),
                    this.options.targetSelector
                ),
                toggleSelector: this.app.getOptions(
                    this.getOptionsPathTo("toggleSelector"),
                    this.options.toggleSelector
                ),
                open: this.app.getOptions(
                    this.getOptionsPathTo("open"),
                    this.options.open
                ),
                directNavigation: this.app.getOptions(
                    this.getOptionsPathTo("directNavigation"),
                    this.options.directNavigation
                ),
                root: this.app.getOptions("router.root", this.options.root),
                navigate: this.options.navigate.bind(this),
                getComponent: this.getComponent.bind(this),
                
            };
        } else {
            return this.options;
        }
    }

    static getComponent(name) {
        if (COMPONENTS.contains(name)) {
            return COMPONENTS.get(name);
        } else {
            return false;
        }
    }

    static initField(list, fields = []) {
        list.forEach((item) => {
            fields.forEach((field) => {
                if (!Object.hasOwn(item, field)) {
                    item[field] = this.DEFAULT[field];
                }
            });
            if (Object.hasOwn(item, "items")) {
                this.initField(item.items, fields);
            }
        });
    }

    static sortList(list) {
        list.sort((item1, item2) => {
            if (Object.hasOwn(item1, "items")) {
                this.sortList(item1.items);
            }
            if (Object.hasOwn(item2, "items")) {
                this.sortList(item2.items);
            }
            if (item1.priority === item2.priority) {
                return item1.title > item2.title ? 1 : -1;
            } else {
                return item1.priority < item2.priority ? 1 : -1;
            }
        });
    }

    static removeDublicates(sections) {
        for (let i = 0; i < sections.length; i++) {
            let priority = sections[i].priority;
            sections
                .filter((section) => {
                    return section.id === sections[i].id;
                })
                .forEach((item, indx) => {
                    if (indx === 0) {
                        return;
                    }
                    if (item.priority < priority) {
                        priority = item.priority;
                    }
                    sections.splice(sections.indexOf(item), 1);
                });
            sections[i].priority = priority;
        }
        return sections;
    }

    static prepareData() {
        const items = [...this.getOptions().items];        
        const sections = [...this.getOptions().sections];

        this.initField(sections, ["priority"]);
        this.removeDublicates(sections);
        this.initField(items, ["priority", "section", "type"]);
        this.sortList(sections);

        sections.push({
            id: this.DEFAULT.section,
            title: this.DEFAULT.sectionTitle,
        });
        this.sortList(items);

        this.sections = sections;
        this.items = items;

        this.menuStructure = this.createStructure();
    }

    static createStructure(){        
        const menuStructure = [];
        this.sections.forEach((section)=>{
            const menuItem = structuredClone(section);
            const subItems = this.items.filter(item => item.section === section.id).map(subitem => structuredClone(subitem));
            if(subItems && subItems.length){
                menuItem.items = subItems;
            }
            menuStructure.push(menuItem);
        });
        return menuStructure;
    }

    static remove() {
        if (this.menu) {
            this.menu.$destroy();
            this.menu = null;
            clearInterval(this.interval);
        }
    }

    static updateIndicator(sectionId, itemId, status) {
        this.updateSection(sectionId, (section) => {
            section.indicator.status = status;
            return section;
        });
        this.updateItem(itemId, (item) => {
            item.indicator.status = status;
            return item;
        });
    }

    static updateTag(sectionId, itemId, tag) {
        this.updateSection(sectionId, (section) => {
            section.tag = tag;
            return section;
        });
        this.updateItem(itemId, (item) => {
            item.tag = tag;
            return item;
        });
    }

    static updateSectionTag(sectionId, tag) {
        this.updateSection(sectionId, (section) => {
            section.tag = { ...section.tag, ...tag };
            return section;
        });
    }

    static updateItemTag(itemId, tag) {
        this.updateItem(itemId, (item) => {
            item.tag = { ...item.tag, ...tag };
            return item;
        });
    }

    static updateSection(sectionId, proc) {
        if (this.menu.props.items && typeof sectionId !== 'undefined') {
            for (let id in this.menu.props.items) {
                if (this.menu.props.items[id].id !== sectionId) continue;
                this.menu.props.items[id] = proc(this.menu.props.items[id]);
            }
        }
    }

    static updateSectionItems(sectionId, proc) {
        if (!this.menu) return;
        if (this.menu.props.items && typeof sectionId !== 'undefined') {
            const index = this.menu.props.items.findIndex(sec => sec.id === sectionId);
            if(index > -1){
                this.menu.props.items[index].items = proc(this.menu.props.items[index].items);    
            }            
        }
    }

    static getSectionIndexByItemId(itemId){
        if (!this.menu) return;
        for(let sectionIndex in this.menu.props.items){
            if (this.menu.props.items[sectionIndex] && Array.isArray(this.menu.props.items[sectionIndex].items)){
                const itemIndex = this.menu.props.items[sectionIndex].items.findIndex(item => item.id === itemId);
                if (itemIndex > -1){
                    return {sectionIndex, itemIndex};
                }
            }
        }        
        return undefined;
    }

    static updateItem(itemId, proc) {
        if (!this.menu) return;
        if (typeof itemId !== 'undefined' && this.items) {
            const place = this.getSectionIndexByItemId(itemId);
            if (place){
                this.menu.props.items[place.sectionIndex].items[place.itemIndex] = proc(this.menu.props.items[place.sectionIndex].items[place.itemIndex]);
            }
        }
    }

    static isTouch() {
        return UICommon.isMobile(true);
    }

    static getSectionComponent() {}
}

export default Menu;
