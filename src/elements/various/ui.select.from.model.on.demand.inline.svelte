<script>
    import notPath from "not-path";
    import UISelect from "../form/ui.select.svelte";
    import { UIButtons, UIButton } from "../button";
    import notCommon from "../../frame/common";
    import { DEFAULT_STATUS_SUCCESS } from "../../frame/const";

    import { onMount, createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let inputStarted = false;
    export let value;
    export let variants = [];
    export let placeholder = "empty select item";
    export let fieldname = "selectFromModel";
    export let modelName = "";
    export let actionName = "";
    export let actionFilter = {};
    export let actionSorter = {};
    export let actionPager = {};
    export let actionSearch = undefined;
    export let optionId = ":_id";
    export let optionTitle = ":title";
    export let icon = false;
    export let required = true;
    export let readonly = false;
    export let multiple = false;
    export let size = 8;
    export let valid = true;
    export let validated = false;
    export let errors = false;
    export let formErrors = false;
    export let formLevelError = false;

    function argumentsSetProvided() {
        return modelName && actionName && actionFilter;
    }

    let loaded = false;

    $: disabled = !loaded;
    let state = "hidden";
    let resultsList = [];

    onMount(async () => {
        if (argumentsSetProvided()) {
            const notApp = notCommon.getApp();
            const Model = notApp
                .getModel(modelName)
                .setFilter(actionFilter)
                .setSorter(actionSorter)
                .setPager(actionPager)
                .setSearch(actionSearch);
            const response = await Model[`$` + actionName]();
            if (response.status === DEFAULT_STATUS_SUCCESS) {
                resultsList = response.result;
                variants = resultsList.map((item) => {
                    return {
                        id: notPath.get(optionId, item),
                        title: notPath.get(optionTitle, item),
                    };
                });
            } else {
                errors = result.errors || [result.message];
            }
        }
    });

    let resolvedValue;

    function onModelChanged({ detail }) {
        resolvedValue = resultsList.find(
            (item) => notPath.get(optionId, item) === detail.value
        );
    }

    const ACTIONS = {
        add: {
            color: "primary",
            icon: "plus",
            action() {
                state = "show";
            },
        },
        resolve: {
            icon: "check",
            color: "primary",
            action() {
                state = "hidden";
                dispatch("resolve", resolvedValue);
            },
        },
        reject: {
            icon: "close",
            color: "danger",
            action() {
                state = "hidden";
                dispatch("reject");
            },
        },
    };
</script>

{#if state === "hidden"}
    <UIButton {...ACTIONS.add}></UIButton>
{:else if state == "show"}
    <div class="field has-addons">
        <UISelect
            {inputStarted}
            {value}
            {variants}
            {placeholder}
            {fieldname}
            {icon}
            {required}
            {readonly}
            {disabled}
            {multiple}
            {size}
            {valid}
            {validated}
            {errors}
            {formErrors}
            {formLevelError}
            on:change={onModelChanged}
        />
    </div>
    <div class="control">
        <UIButtons values={[ACTIONS.resolve, ACTIONS.reject]}></UIButtons>
    </div>
{/if}
