import UISideMenu from './ui.side.menu.svelte';

class SideMenu{
	static DEFAULT = {
		section: 'any',
		sectionTitle: 'Меню',
		priority: 0,
	};
	static app = false;
	static menu;
	static options = {
		items: [],
		sections: [],
		targetSelector: '#side-menu',
		root: '/',
		navigate: (urls)=>{
			if(this.app){
				let func = this.app.getWorking('router');
				if (func){
					func.navigate(urls.short);
				}
			}else{
				document.location.assign(urls.full);
			}
		}
	};
	static items = [];
	static sections = [];
	static location;
	static interval;

	static setApp(app){
		this.app = app;
		return this;
	}

	static setOptions(options){
		this.options = Object.assign(this.options, options);
		return this;
	}

	static getOptions(){
		if(this.app){
			return {
				items: this.app.getOptions('menu',  this.options.items),
				sections: this.app.getOptions('sections', this.options.sections),
				targetSelector: this.app.getOptions('mainMenuSelector', this.options.targetSelector),
				root: this.app.getOptions('router.root', this.options.root),
				navigate: this.app.getWorking('router', this.options).navigate
			};
		}else{
			return this.options;
		}
	}

	static initField(list, field){
		list.forEach((item)=>{
			if(!Object.prototype.hasOwnProperty.call(item, field)){
				item[field] = this.DEFAULT[field];
			}
			if(Object.prototype.hasOwnProperty.call(item, 'items')){
				this.initField(item.items, field);
			}
		});
	}

	static sortList(list){
		list.sort((item1, item2)=>{
			if(Object.prototype.hasOwnProperty.call(item1, 'items')){
				this.sortList(item1.items);
			}
			if(Object.prototype.hasOwnProperty.call(item2, 'items')){
				this.sortList(item2.items);
			}
			if(item1.priority === item2.priority){
				return item1.title > item2.title?1:-1;
			}else{
				return item1.priority < item2.priority?1:-1;
			}
		});
	}

	static removeDublicates(sections){
		for (let i = 0; i < sections.length; i++){
			let priority = sections[i].priority;
			sections
				.filter((section)=>{ return section.id === sections[i].id; })
				.forEach((item, indx) => {
					if(indx === 0){ return; }
					if(item.priority > priority){
						priority = item.priority;
					}
					sections.splice(sections.indexOf(item), 1);
				});
			sections[i].priority = priority;
		}
		return sections;
	}

	static prepareData(){
		let items = [];
		items.push(...this.getOptions().items);
		let sections = [];
		sections.push(...this.getOptions().sections);

		this.initField(sections, 'priority');
		this.removeDublicates(sections);
		this.initField(items, 'priority');
		this.initField(items,'section');
		this.sortList(sections);

		sections.push({
			id: this.DEFAULT.section,
			title: this.DEFAULT.sectionTitle
		});
		this.sortList(items);

		this.sections = sections;
		this.items = items;
	}

	static render(app){
		if(app){
			this.setApp(app);
		}
		this.prepareData();
		console.log(this.sections);
		console.log(this.items);
		if (!this.menu) {
			this.menu = new UISideMenu({
				target: document.querySelector(this.getOptions().targetSelector),
				props:{
					items:  			this.items,
					sections:  		this.sections,
					root:   			this.getOptions().root,
					navigate:		  this.getOptions().navigate
				}
			});
			this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
		}
	}

	static remove(){
		if (this.menu) {
			this.menu.$destroy();
			this.menu = null;
			clearInterval(this.interval);
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
		let url = window.location.toString(),	lastLocation = this.location;
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
}

export default SideMenu;
