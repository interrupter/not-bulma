import { expect } from "chai";
import UIListSelectWithGroupsBehaviourSingle from "../src/elements/list/select/ui.list.select.with.groups.behaviour.single.svelte.js";

describe("UIListSelectWithGroupsBehaviourSingle", function () {
    it("sublimeValue", function () {
        expect(
            UIListSelectWithGroupsBehaviourSingle.sublimeValue({
                group: 1,
                id: 2,
            })
        ).to.be.deep.equal({
            groupId: 1,
            valueId: 2,
        });
    });
});
