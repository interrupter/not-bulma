import UIBreadcrumbs from './ui.breadcrumbs.svelte';

class Breadcrumbs{
	static ui = null;
	static head = [];
	static tail = [];
	static app = null;

	static render(app){
		if (!this.ui) {
			this.ui = new UIBreadcrumbs({
				target: document.querySelector(app.getOptions('breadcrumbsSelector')),
				props:{
					items:  this.getBreadcrumbs(),
					root:   app.getOptions('router.root'),
					go:		  url => app.getWorking('router').navigate(url)
				}
			});
		}
	}

	static changeHead(head){
		this.head.splice(0,this.head.length,...head);
		return this;
	}

	static changeTail(tail){
		this.tail.splice(0, this.tail.length,...tail);
		return this;
	}

	static getBreadcrumbs(){
		let crumbs = [];
		crumbs.push(...this.head);
		crumbs.push(...this.tail);
		return crumbs;
	}

	static update(){
		if(this.ui){
			this.ui.$set({ items: this.getBreadcrumbs() });
		}
	}

	static remove(){
		if (this.ui) {
			this.ui.$destroy();
			this.ui = null;
		}
	}

}

export default Breadcrumbs;
