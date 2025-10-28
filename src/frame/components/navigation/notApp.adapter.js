import { COMPONENTS } from "../../LIB.js";

class MenuNotAppAdapter {
    #app;
    #type;
    #options = {
        directNavigation: false,
        navigate: (urls) => {
            this.hide();
            if (!this.isDirectNavigation()) {
                const navigate = this.getNavigateFunction();
                if (navigate) {
                    return navigate(urls.short);
                }
            }
            document.location.assign(urls.full);
        },
    };

    constructor(app, menuType, options = {}) {
        this.#app = app;
        this.#type = menuType;
        this.#options = {
            ...this.#options,
            ...options,
        };
    }

    getNavigateFunction() {
        return this.#app.getWorking("router")?.navigate;
    }

    getOptionsPathTo(what) {
        return `menu.${this.#type}.${what}`;
    }

    isDirectNavigation() {
        return this.#app.getOptions(
            this.getOptionsPathTo("directNavigation"),
            this.#options.directNavigation
        );
    }

    getOptions(fallback = {}) {
        return {
            brand: this.#app.getOptions("brand", this.#options.brand),
            items: this.#app.getOptions(
                this.getOptionsPathTo("items"),
                fallback.items
            ),
            sections: this.#app.getOptions(
                this.getOptionsPathTo("sections"),
                fallback.sections
            ),
            targetSelector: this.#app.getOptions(
                this.getOptionsPathTo("targetSelector"),
                fallback.targetSelector
            ),
            toggleSelector: this.#app.getOptions(
                this.getOptionsPathTo("toggleSelector"),
                fallback.toggleSelector
            ),
            open: this.#app.getOptions(
                this.getOptionsPathTo("open"),
                fallback.open
            ),
            directNavigation: this.#app.getOptions(
                this.getOptionsPathTo("directNavigation"),
                fallback.directNavigation
            ),
            root: this.#app.getOptions("router.root", fallback.root),
            navigate: fallback.navigate,
            getComponent: this.getComponent.bind(this),
        };
    }

    getComponent(name) {
        if (COMPONENTS.contains(name)) {
            return COMPONENTS.get(name);
        } else {
            return false;
        }
    }
}

export default MenuNotAppAdapter;
