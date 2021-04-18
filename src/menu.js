import {COMPONENTS} from './frame';

class Menu {
  static MAX_TOUCH_WIDTH = 1023;
  static DEFAULT = {
    section: 'any',
    sectionTitle: 'Меню',
    priority: 0,
    //link, button, dropdown, component
    type:       'link',
  };
  static app = false;
  static directNavigation = false;
  static menu;
  static options = {
    directNavigation: false,
    navigate: (urls) => {
      this.hide();
      if (!(this.isDirectNavigation()) && this.app) {
        let func = this.app.getWorking('router');
        if (func) {
          return func.navigate(urls.short);
        }
      }
      document.location.assign(urls.full);
    }
  };

  static items = [];
  static sections = [];
  static location;
  static interval;

  static setApp(app) {
    this.app = app;
    return this;
  }

  static setOptions(options) {
    this.options = {...this.options, ...options};
    return this;
  }

  static getOptionsPathTo(what){
    return `menu.${this.options.type}.${what}`;
  }

  static isDirectNavigation(){
    return this.app?this.app.getOptions(this.getOptionsPathTo('directNavigation'), this.options.directNavigation):this.options.directNavigation;
  }

  static getOptions() {
    if (this.app) {
      return {
        brand:           this.app.getOptions('brand', this.options.brand ),
        items:           this.app.getOptions(this.getOptionsPathTo('items'), this.options.items),
        sections:       this.app.getOptions(this.getOptionsPathTo('sections'), this.options.sections),
        targetSelector: this.app.getOptions(this.getOptionsPathTo('targetSelector'), this.options.targetSelector),
        toggleSelector: this.app.getOptions(this.getOptionsPathTo('toggleSelector'), this.options.toggleSelector),
        open:           this.app.getOptions(this.getOptionsPathTo('open'), this.options.open),
        directNavigation:           this.app.getOptions(this.getOptionsPathTo('directNavigation'), this.options.directNavigation),
        root:           this.app.getOptions('router.root', this.options.root),
        navigate:       this.options.navigate.bind(this),
        getComponent:   this.getComponent.bind(this),
      };
    } else {
      return this.options;
    }
  }

  static getComponent(name){
    if (COMPONENTS.contains(name)){
      return COMPONENTS.get(name);
    }else{
      return false;
    }
  }

  static initField(list, fields = []) {
    list.forEach((item) => {
      fields.forEach((field)=>{
        if (!Object.prototype.hasOwnProperty.call(item, field)) {
          item[field] = this.DEFAULT[field];
        }
      });
      if (Object.prototype.hasOwnProperty.call(item, 'items')) {
        this.initField(item.items, fields);
      }
    });
  }

  static sortList(list) {
    list.sort((item1, item2) => {
      if (Object.prototype.hasOwnProperty.call(item1, 'items')) {
        this.sortList(item1.items);
      }
      if (Object.prototype.hasOwnProperty.call(item2, 'items')) {
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
    let items = [];
    items.push(...this.getOptions().items);
    let sections = [];
    sections.push(...this.getOptions().sections);

    this.initField(sections, ['priority']);
    this.removeDublicates(sections);
    this.initField(items, ['priority', 'section', 'type']);
    this.sortList(sections);

    sections.push({
      id: this.DEFAULT.section,
      title: this.DEFAULT.sectionTitle
    });
    this.sortList(items);

    this.sections = sections;
    this.items = items;
  }

  static remove() {
    if (this.menu) {
      this.menu.$destroy();
      this.menu = null;
      clearInterval(this.interval);
    }
  }

  static updateIndicator(sectionId, itemId, state){
    this.updateSection(sectionId, (section)=>{
      section.indicator.state = state;
    });
    this.updateItem(itemId, (item)=>{
      item.indicator.state = state;
    });
  }

  static updateTag(sectionId, itemId, tag){
    this.updateSection(sectionId, (section)=>{
      section.tag = tag;
    });
    this.updateItem(itemId, (item)=>{
      item.tag = tag;
    });
  }

  static updateSectionTag(sectionId, tag){
    this.updateSection(sectionId, (section)=>{
      section.tag = {...section.tag, ...tag};
    });
  }

  static updateItemTag(itemId, tag){
    this.updateItem(itemId, (item)=>{
      item.tag = {...item.tag, ...tag};
    });
  }

  static updateSection(sectionId, proc){
    if(this.sections && sectionId){
      for(let section in this.sections){
        if( this.sections[section].id !== sectionId ) continue;
        proc(this.sections[section]);
      }
      if(this.menu){
        this.menu.$set({ sections: this.sections });
      }
    }
  }

  static updateSectionItems(sectionId, proc){
    if(this.sections && sectionId){
      let oldList = this.items.filter(item =>item.section === sectionId);
      for(let i of oldList){
        this.items.splice(this.items.indexOf(i), 1);
      }
      this.items.push(...proc(oldList));
      if(this.menu){
        this.menu.$set({ items: this.items });
      }
    }
  }

  static updateItem(itemId, proc){
    if(itemId && this.items){
      this.items.forEach((item)=>{
        if (item.id !== itemId) return;
        proc(item);
      });
      if(this.menu){
        this.menu.$set({ items: this.items });
      }
    }
  }

  static isTouch(){
    return window.innerWidth <= this.MAX_TOUCH_WIDTH;
  }

  static getSectionComponent(){

  }

}

export default Menu;
