import UIBreadcrumbs from './ui.breadcrumbs.svelte';

class Breadcrumbs{
	static ui = null;
	static head = [];
	static tail = [];

	static render({target, root = '', navigate}){
		this.remove();
		this.ui = new UIBreadcrumbs({
			target,
			props:{
				items:  this.getBreadcrumbs(),
				root:   root,
				go:		  navigate
			}
		});
	}

	static setHead(head){
		this.head.splice(0,this.head.length,...head);
		return this;
	}

	static setTail(tail){
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
		return this;
	}

}

export default Breadcrumbs;
