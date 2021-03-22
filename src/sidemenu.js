import Menu from './menu.js';
import UISideMenu from './sidemenu/ui.side.menu.svelte';

const TYPE = 'side';

class SideMenu extends Menu {
	static nav;
	static main;
	static aside;

	static DEFAULT = {
		section: 'any',
		sectionTitle: 'Меню',
		priority: 0,
		open: false
	};

	static options = {
		type: TYPE,
		items: [],
		sections: [],
		targetSelector: `#${TYPE}-menu`,
		toggleSelector: `.${TYPE}-menu-toggle`,
		root: '/',
		open: false,
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

	static render(app) {
		if (app) {
			this.setApp(app);
		}
		this.prepareData();
		if (!this.menu) {
			let target = document.querySelector(this.getOptions().targetSelector);
			if(!target){return;}
			this.menu = new UISideMenu({
				target,
				props: {
					items: this.items,
					sections: this.sections,
					root: this.getOptions().root,
					navigate: this.getOptions().navigate
				}
			});
			this.initSizeResponse();
			this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
			this.bindToggle();
		}
	}

	static itemIsActive(itemURL) {
		return ((this.location + '/').indexOf(itemURL + '/') > -1);
	}

	static updateMenu() {
		Array.from(document.querySelectorAll(this.getOptions().targetSelector + ' a')).forEach((item) => {
			if (this.itemIsActive(item.getAttribute('href'))) {
				item.classList.add('is-active');
			} else {
				item.classList.remove('is-active');
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
		this.nav = document.querySelector('nav.navbar');
		this.aside = document.querySelector('aside');
		this.main = document.querySelector('main');
		this.resizeAsideAndMain(this.aside, this.main, this.nav);
		this.resizeMain(this.main, this.aside);
		window.addEventListener('resize', this.resizeMain.bind(this));
		if(this.getOptions().open){
			this.show();
		}else{
			this.hide();
		}
	}

	static resizeMain() {
		if(this.isTouch()){
			if(this.aside.classList.contains('is-active')){
				this.main.style.display = 'none';
			}else{
				this.main.style.display = 'block';
				this.main.style.marginLeft = '0px';
			}
		}else{
			let rect = this.aside.getBoundingClientRect();
			this.main.style.display = 'block';
			if (this.main.style.height === '0px') {
				this.main.style.height = 'auto';
			}
			this.main.style.marginLeft = (rect.width + rect.left) + 'px';
		}
	}

	static resizeAside() {
		if (this.aside.style.display !== 'none') {
			let rect = this.nav.getBoundingClientRect();
			this.aside.style.height = (window.innerHeight - rect.height) + 'px';
			this.aside.style.marginTop = (rect.height) + 'px';
		}
	}

	static resizeAsideAndMain() {
		let rect = this.nav.getBoundingClientRect();
		this.aside.style.height = (window.innerHeight - rect.height) + 'px';
		//this.aside.style.paddingTop = (rect.height) + 'px';
		this.main.style.marginTop = (rect.height) + 'px';
	}

	static bindToggle() {
		let els = document.querySelectorAll(this.getOptions().toggleSelector);
		Array.from(els).forEach((el) => {
			el.removeEventListener('click', this.toggle.bind(this));
			el.addEventListener('click', this.toggle.bind(this));
		});
	}

	static toggle(e) {
		e && e.preventDefault();
		this.aside.classList.toggle('is-active');
		this.resizeMain();
		return false;
	}

	static hide(e) {
		e && e.preventDefault();
		this.aside.classList.remove('is-active');
		this.resizeMain();
		return false;
	}

	static show(e) {
		e && e.preventDefault();
		this.classList.add('is-active');
		this.resizeMain();
		return false;
	}

	static isOpen(){
		if(this.aside){
			return this.aside.classList.contains('is-active');
		}else{
			return true;
		}
	}
}

export default SideMenu;
