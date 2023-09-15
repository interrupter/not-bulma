<script>
    import UICommon from "../common";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import { createEventDispatcher } from "svelte";
    let dispatch = createEventDispatcher();

    import { UIColumns, UIColumn } from "../layout";
    import { UIButton } from "../button";
    import UINumber from "./ui.number.svelte";
    import UITextfield from "./ui.textfield.svelte";
    import { UITitle } from "../various";

    export let fieldname = "numbers_list";
    export let value = {};
    export let label = "named numbers list";

    export let inputStarted = false;
    export let placeholder = "new item";
    export let readonly = false;
    export let valid = true;
    export let validated = false;
    export let errors = false;
    export let formErrors = false;

    $: list = Object.keys(value).map((name) => {
        return {
            id: name,
            title: name,
            number: value[name],
        };
    });

    $: allErrors = [].concat(
        errors ? errors : [],
        formErrors ? formErrors : []
    );
    $: showErrors = !(validated && valid) && inputStarted;
    $: validationClasses =
        valid === true || !inputStarted
            ? UICommon.CLASS_OK
            : UICommon.CLASS_ERR;

    function remove(id) {
        if (Object.hasOwn(value, id)) {
            delete value[id];
            value = value;
            dispatch("change", { value, field: fieldname });
        }
    }

    function add() {
        const id = newVal.id.trim();
        const number = parseInt(newVal.number);
        if (id && id !== "" && !isNaN(number) && !Object.hasOwn(value, id)) {
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

    let newVal = createNewVal();
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
