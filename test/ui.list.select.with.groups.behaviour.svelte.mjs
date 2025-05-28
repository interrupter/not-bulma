import { expect } from "chai";
import UIListSelectWithGroupsBehaviour from "../src/elements/list/select/ui.list.select.with.groups.behaviour.svelte.js";

describe("UIListSelectWithGroupsBehaviour", function () {
    it("sublimeValue", function () {
        expect(
            UIListSelectWithGroupsBehaviour.sublimeValue({
                group: 1,
                id: 2,
            })
        ).to.be.deep.equal({
            groupId: 1,
            valueId: 2,
        });
    });

    describe("getSelectorGroupIndex", () => {
        it("empty list, groupId is undefined", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorGroupIndex(
                    [],
                    undefined
                )
            ).to.be.undefined;
        });

        it("empty list, groupId is 1", function () {
            expect(UIListSelectWithGroupsBehaviour.getSelectorGroupIndex([], 1))
                .to.be.undefined;
        });

        it("empty list, groupId is string '100'", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorGroupIndex([], "12")
            ).to.be.undefined;
        });

        const DUMMY_LIST_1 = [
            {
                id: 13,
            },
            {
                id: 14,
            },
            {
                id: 15,
            },
        ];

        it("list, groupId is not empty and exists in list", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorGroupIndex(
                    DUMMY_LIST_1,
                    14
                )
            ).to.be.equal(1);
        });

        it("list, groupId is targeted first item", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorGroupIndex(
                    DUMMY_LIST_1,
                    13
                )
            ).to.be.equal(0);
        });

        it("list, groupId is targeted last item", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorGroupIndex(
                    DUMMY_LIST_1,
                    15
                )
            ).to.be.equal(2);
        });
    });

    const DUMMY_LIST_2 = [
        {
            id: 13,
            description: {
                values: [
                    {
                        value: { id: 131, title: "131" },
                    },
                ],
            },
        },
        {
            id: 14,
            description: {
                values: [
                    {
                        value: { id: 141, title: "141" },
                    },
                    {
                        value: { id: 142, title: "142" },
                    },
                ],
            },
        },
        {
            id: 15,
            description: {
                values: [
                    {
                        value: { id: 151, title: "151" },
                    },
                    {
                        value: { id: 152, title: "152" },
                    },
                ],
            },
        },
    ];

    describe("getSelectorItemIndex", () => {
        it("empty list, groupIndex is undefined, itemId is undefined", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemIndex(
                    [],
                    undefined,
                    undefined
                )
            ).to.be.undefined;
        });

        it("list, groupIndex is exist, itemId is present", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemIndex(
                    DUMMY_LIST_2,
                    0,
                    131
                )
            ).to.be.equal(0);
        });

        it("list, groupIndex is exist, itemId is not present", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemIndex(
                    DUMMY_LIST_2,
                    0,
                    132
                )
            ).to.be.undefined;
        });
    });

    describe("getSelectorItemIndexes", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemIndexes(
                    [],
                    undefined,
                    undefined
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemIndexes(
                    DUMMY_LIST_2,
                    13,
                    132
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemIndexes(
                    DUMMY_LIST_2,
                    13,
                    131
                )
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("getSelectorItem", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItem(
                    [],
                    undefined,
                    undefined
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItem(
                    DUMMY_LIST_2,
                    13,
                    132
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItem(
                    DUMMY_LIST_2,
                    13,
                    131
                )
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("getSelectorItemValue", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemValue(
                    [],
                    undefined,
                    undefined
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemValue(
                    DUMMY_LIST_2,
                    13,
                    132
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getSelectorItemValue(
                    DUMMY_LIST_2,
                    13,
                    131
                )
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("getDefaultSelectorItemSublime", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getDefaultSelectorItemSublime(
                    []
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getDefaultSelectorItemSublime(
                    DUMMY_LIST_2
                )
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getDefaultSelectorItemSublime(
                    DUMMY_LIST_2
                )
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("updateSelectorItem", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(UIListSelectWithGroupsBehaviour.updateSelectorItem([])).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.updateSelectorItem(DUMMY_LIST_2)
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.updateSelectorItem(DUMMY_LIST_2)
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("uiOn", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(UIListSelectWithGroupsBehaviour.uiOn([])).to.be.undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(UIListSelectWithGroupsBehaviour.uiOn(DUMMY_LIST_2)).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.uiOn(DUMMY_LIST_2)
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("uiOff", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(UIListSelectWithGroupsBehaviour.uiOff([])).to.be.undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(UIListSelectWithGroupsBehaviour.uiOff(DUMMY_LIST_2)).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.uiOff(DUMMY_LIST_2)
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("getBehaviour", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(UIListSelectWithGroupsBehaviour.getBehaviour([])).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(UIListSelectWithGroupsBehaviour.getBehaviour(DUMMY_LIST_2))
                .to.be.undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.getBehaviour(DUMMY_LIST_2)
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("countOfSelected", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(UIListSelectWithGroupsBehaviour.countOfSelected([])).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.countOfSelected(DUMMY_LIST_2)
            ).to.be.undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.countOfSelected(DUMMY_LIST_2)
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("toggle", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(UIListSelectWithGroupsBehaviour.toggle([])).to.be.undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(UIListSelectWithGroupsBehaviour.toggle(DUMMY_LIST_2)).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.toggle(DUMMY_LIST_2)
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });

    describe("updateUI", () => {
        it("empty list, groupId is undefined, valueId is undefined", function () {
            expect(UIListSelectWithGroupsBehaviour.updateUI([])).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is not exist", function () {
            expect(UIListSelectWithGroupsBehaviour.updateUI(DUMMY_LIST_2)).to.be
                .undefined;
        });

        it("list, groupId is exist, valueId is exist", function () {
            expect(
                UIListSelectWithGroupsBehaviour.updateUI(DUMMY_LIST_2)
            ).to.be.deep.equal({
                groupIndex: 0,
                itemIndex: 0,
            });
        });
    });
});
