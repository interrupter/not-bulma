import notCommon from "../common.js";
import { Builder } from "not-validation";
import Validator from "validator";

import UIGenericSelector from "../../elements/modal/ui.generic.selector.svelte";

const emptyResult = () => {
    return {
        list: [],
        count: 0,
        page: 0,
        pages: 0,
        skip: 0,
    };
};

export default class notServiceModelSearch {
    constructor(app, modelName) {
        this.modelName = modelName;
        this.app = app;
    }

    destroy() {
        delete this.app;
    }

    getSearchRouteName() {
        return "listAndCount";
    }

    getDataLoadRouteName() {
        return "get";
    }

    transformSearchResult(result) {
        result.list = result.list.map((item) => {
            return {
                _id: item._id,
                id: item[`${this.modelName}ID`],
                title: item.name || item.title || item.label || item.username,
            };
        });
        return result;
    }

    transformSelectedResult(result) {
        return {
            _id: result._id,
            [`${this.modelName}ID`]: result.id,
            title: result.title,
        };
    }

    async searchByTerm(term) {
        try {
            if (term.value.length > 2) {
                const model = this.app.getModel(this.modelName);
                model.setSearch(term.value);
                const response = await model[`$${this.getSearchRouteName()}`]();
                if (response.status === "ok") {
                    return this.transformSearchResult(response.result);
                } else {
                    return emptyResult();
                }
            } else {
                return emptyResult();
            }
        } catch (e) {
            return emptyResult();
        }
    }

    openSelector() {
        return new Promise((resolve, reject) => {
            try {
                const el = new UIGenericSelector({
                    target: document.body,
                    props: {},
                });
                el.$on("termChange", async ({ detail }) => {
                    const results = await this.searchByTerm(detail);
                    el.$set({ results });
                });

                el.$on("next", () => {
                    console.log("next selector results");
                });

                el.$on("prev", () => {
                    console.log("prev selector results");
                });

                el.$on("reject", () => {
                    el.$destroy();
                    reject();
                });
                el.$on("resolve", ({ detail }) => {
                    el.$destroy();
                    resolve(this.transformSelectedResult(detail));
                });
            } catch (e) {
                this.app.error(e);
                reject(e);
            }
        });
    }

    async loadData(_id) {
        try {
            if (_id && _id.length > 10) {
                const model = this.app.getModel(this.modelName, { _id });
                const response = await model[
                    `$${this.getDataLoadRouteName()}`
                ]();
                if (response.status === "ok") {
                    return response.result;
                } else {
                    return null;
                }
            } else {
                return null;
            }
        } catch (e) {
            this.app.error(e);
            return null;
        }
    }
}
