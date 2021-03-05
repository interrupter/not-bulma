import Menu from './menu.js';
import UISideMenu from './ui.side.menu.svelte';

const TYPE = 'side';

class SideMenu extends Menu {
	static DEFAULT = {
		section: 'any',
		sectionTitle: 'Меню',
		priority: 0,
	};
	static options = {
		type: TYPE,
		items: [],
		sections: [],
		targetSelector: `#${TYPE}-menu`,
		toggleSelector: `.${TYPE}-menu-toggle`,
		root: '/',
		navigate: (urls) => {
			if (this.app) {
				let func = this.app.getWorking('router');
				if (func) {
					func.navigate(urls.short);
				}
			} else {
				document.location.assign(urls.full);
			}
		}
	};

	static render(app) {
		if (app) {
			this.setApp(app);
		}
		this.prepareData();
		if (!this.menu) {
			this.menu = new UISideMenu({
				target: document.querySelector(this.getOptions().targetSelector),
				props: {
					items: this.items,
					sections: this.sections,
					root: this.getOptions().root,
					navigate: this.getOptions().navigate
				}
			});
			this.interval = setInterval(this.updateMenuActiveItem.bind(this), 200);
			this.bindToggle();
		}
	}

	static itemIsActive(itemURL){
		return ((this.location + '/').indexOf(itemURL + '/') > - 1);
	}

	static updateMenu() {
		Array.from(document.querySelectorAll(this.getOptions().targetSelector + ' aside.menu a')).forEach((item) => {
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

	static bindToggle(){
		let els = document.querySelectorAll(this.getOptions().toggleSelector);
		Array.from(els).forEach((el) => {
			el.removeEventListener('click', this.toggle.bind(this));
			el.addEventListener('click', this.toggle.bind(this));
		});
	}

	static toggle(e){
		e && e.preventDefault();
		let el = document.querySelector(this.getOptions().targetSelector);
		el.classList.toggle('is-hidden-touch');
		el.classList.toggle('is-12');
		return false;
	}

	static hide(e){
		e && e.preventDefault();
		let el = document.querySelector(this.getOptions().targetSelector);
		el.classList.add('is-hidden-touch');
		el.classList.remove('is-12');
		return false;
	}
}

export default SideMenu;
