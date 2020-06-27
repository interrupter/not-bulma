import UISideMenu from './ui.side.menu.svelte';

class SideMenu{
	static menu;
	static location;
	static interval;
	static render(app){
		if (!this.menu) {
			this.menu = new UISideMenu({
				target: document.querySelector(app.getOptions('mainMenuSelector')),
				props:{
					items:  app.getOptions('menu'),
					root:   app.getOptions('router.root'),
					go:		   url => app.getWorking('router').navigate(url)
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
		Array.from(document.querySelectorAll('aside.menu a')).forEach((item) => {
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
