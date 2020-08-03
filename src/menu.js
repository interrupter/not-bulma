class Menu {
	static DEFAULT = {
		section: 'any',
		sectionTitle: 'Меню',
		priority: 0,
	};
	static app = false;
	static menu;
	static options = {
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

	static items = [];
	static sections = [];
	static location;
	static interval;

	static setApp(app) {
		this.app = app;
		return this;
	}

	static setOptions(options) {
		this.options = Object.assign(this.options, options);
		return this;
	}

	static getOptionsPathTo(what){
		return `menu.${this.options.type}.${what}`;
	}

	static getOptions() {
		if (this.app) {
			return {
				items: this.app.getOptions(this.getOptionsPathTo('items'), this.options.items),
				sections: this.app.getOptions(this.getOptionsPathTo('sections'), this.options.sections),
				targetSelector: this.app.getOptions('mainMenuSelector', this.options.targetSelector),
				root: this.app.getOptions('router.root', this.options.root),
				navigate: this.app.getWorking('router', this.options).navigate
			};
		} else {
			return this.options;
		}
	}

	static initField(list, field) {
		list.forEach((item) => {
			if (!Object.prototype.hasOwnProperty.call(item, field)) {
				item[field] = this.DEFAULT[field];
			}
			if (Object.prototype.hasOwnProperty.call(item, 'items')) {
				this.initField(item.items, field);
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

		this.initField(sections, 'priority');
		this.removeDublicates(sections);
		this.initField(items, 'priority');
		this.initField(items, 'section');
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

}

export default Menu;
