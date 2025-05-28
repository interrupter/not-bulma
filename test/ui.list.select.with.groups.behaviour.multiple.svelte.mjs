import { expect } from "chai";
import UIListSelectWithGroupsBehaviourMultiple from "../src/elements/list/select/ui.list.select.with.groups.behaviour.multiple.svelte.js";

describe("UIListSelectWithGroupsBehaviourMultiple", function () {
    it("sublimeValue", function () {
        expect(
            UIListSelectWithGroupsBehaviourMultiple.sublimeValue({
                group: 1,
                id: 2,
            })
        ).to.be.deep.equal({
            groupId: 1,
            valueId: 2,
        });
    });
});
