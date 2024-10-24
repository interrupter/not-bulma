<script>
    import { run } from 'svelte/legacy';

    import UICommon from "../common";
    import notCommon from "../../frame/common";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    import { UIColumns, UIColumn } from "../layout";
    import { UIButton } from "../button";
    import UINumber from "./ui.number.svelte";
    import UITextfield from "./ui.textfield.svelte";
    import { UITitle } from "../various";


    /**
     * @typedef {Object} Props
     * @property {string} [fieldname]
     * @property {any} [value]
     * @property {string} [label]
     * @property {boolean} [inputStarted]
     * @property {string} [placeholder]
     * @property {boolean} [readonly]
     * @property {boolean} [valid]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     */

    /** @type {Props} */
    let {
        fieldname = "numbers_list",
        value = $bindable({}),
        label = "named numbers list",
        inputStarted = false,
        placeholder = $bindable("new item"),
        readonly = false,
        valid = true,
        validated = false,
        errors = false,
        formErrors = false
    } = $props();

    let list = $derived(Object.keys(value).map((name) => {
        return {
            id: name,
            title: name,
            number: value[name],
        };
    }));

    let allErrors;
    run(() => {
        allErrors = [].concat(
            errors ? errors : [],
            formErrors ? formErrors : []
        );
    });
    let showErrors;
    run(() => {
        showErrors = !(validated && valid) && inputStarted;
    });
    let validationClasses;
    run(() => {
        validationClasses =
            valid === true || !inputStarted
                ? UICommon.CLASS_OK
                : UICommon.CLASS_ERR;
    });

    function remove(id) {
        if (notCommon.objHas(value, id)) {
            delete value[id];
            value = value;
            dispatch("change", { value, field: fieldname });
        }
    }

    function add() {
        const id = newVal.id.trim();
        const number = parseInt(newVal.number);
        if (id && id !== "" && !isNaN(number) && !notCommon.objHas(value, id)) {
            value[id] = number;
        }
        dispatch("change", { value, field: fieldname });
    }

    const createNewVal = () => {
        return {
            id: "",
            number: 0,
        };
    };

    let newVal = $state(createNewVal());
</script>

<UITitle title={label} size={5} />
{#each list as item (item.id)}
    <UIColumns>
        <UIColumn classes="is-6">
            {item.title}
        </UIColumn>
        <UIColumn classes="is-4">
            {item.number}
        </UIColumn>
        {#if !readonly}
            <UIColumn classes="is-2">
                <UIButton icon={"minus"} action={() => remove(item.id)} />
            </UIColumn>
        {/if}
    </UIColumns>
{/each}
{#if !readonly}
    <UIColumns>
        <UIColumn classes="is-6">
            <UITextfield bind:value={newVal.id} bind:placeholder />
        </UIColumn>
        <UIColumn classes="is-4">
            <UINumber bind:value={newVal.number} />
        </UIColumn>
        <UIColumn classes="is-2">
            <UIButton icon={"plus"} action={() => add()} />
        </UIColumn>
    </UIColumns>
{/if}
<ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
/>
