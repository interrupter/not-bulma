import Menu from './menu.js';
import UITopMenu from './ui.top.menu.svelte';

class TopMenu extends Menu{
	static DEFAULT = {
		section: 'any',
		sectionTitle: 'Меню',
		priority: 0,
	};

	static options = {
		items: [],
		sections: [],
		targetSelector: '#top-menu',
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

	static render(app){
		if(app){
			this.setApp(app);
		}
		this.prepareData();
		if (!this.menu) {
			this.menu = new UITopMenu({
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

export default TopMenu;