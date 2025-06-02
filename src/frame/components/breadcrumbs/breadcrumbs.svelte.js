import { mount, unmount } from "svelte";

let local_ui_props = $state({});

class notBreadcrumbs {
    static UIConstructor = null;
    static ui = null;
    static head = [];
    static tail = [];

    static initUIProps(root, navigate) {
        local_ui_props = {
            items: this.getBreadcrumbs(),
            root: root,
            go: navigate,
        };
    }

    static render({ target, root = "", navigate }) {
        this.remove();
        if (notBreadcrumbs.UIConstructor) {
            this.initUIProps(root, navigate);
            this.ui = mount(notBreadcrumbs.UIConstructor, {
                target,
                props: local_ui_props,
            });
        }
        return this;
    }

    static setHead(head) {
        this.head.splice(0, this.head.length, ...head);
        return this;
    }

    static setTail(tail) {
        this.tail.splice(0, this.tail.length, ...tail);
        return this;
    }

    static getBreadcrumbs() {
        let crumbs = [];
        crumbs.push(...this.head);
        crumbs.push(...this.tail);
        return crumbs;
    }

    static update() {
        if (this.ui) {
            local_ui_props.items = this.getBreadcrumbs();
        }
    }

    static remove() {
        if (this.ui) {
            umount(this.ui);
            this.ui = null;
        }
        return this;
    }
}

export default notBreadcrumbs;
