import Menu from './menu.js';
import UINavbarTop from './navbar/ui.top.svelte';
const TYPE = 'top';

class TopMenu extends Menu{
  static DEFAULT = {
    section: 'any',
    sectionTitle: 'Меню',
    priority: 0,
    //link, button, dropdown, component
    type:       'link',
    place:      'main'
  };

  static options = {
    brand:     false,
    type:     TYPE,
    items:     [],
    sections: [],
    targetSelector: `#${TYPE}-menu`,
    root: '/',
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

  static render(app){
    if(app){
      this.setApp(app);
    }
    this.prepareData();
    if (!this.menu) {
      let target = document.querySelector(this.getOptions().targetSelector);
      if (!target){return;}
      this.menu = new UINavbarTop({
        target,
        props:{
          brand:         this.getOptions().brand,
          items:        this.items,
          sections:      this.sections,
          root:         this.getOptions().root,
          navigate:      this.getOptions().navigate
        }
      });
      this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
    }
  }

  static updateMenu(url){
    Array.from(document.querySelectorAll(this.getOptions().targetSelector + ' aside.menu a')).forEach((item) => {
      if( (item.href == url) || (url.href && url.href.indexOf(item.href) == 0)){
        item.classList.add('is-active');
      }else{
        item.classList.remove('is-active');
      }
    });
  }

  static updateMenuActiveItem(){
    let url = window.location.toString(),  lastLocation = this.location;
    if(lastLocation){
      if ( url !== lastLocation ){
        this.location = url;
        this.updateMenu(url);
      }
    }else{
      this.location = url;
      this.updateMenu(url);
    }
  }

  static toggle(){
    let el = document.querySelector(this.getOptions().targetSelector);
    el.classList.toggle('is-active');
  }

  static hide(){
    let el = document.querySelector(this.getOptions().targetSelector);
    el.classList.remove('is-active');
  }

  static setBurgerState(menuClosed){
    this.menu.$set({
      menuClosed
    });
  }

}

export default TopMenu;
