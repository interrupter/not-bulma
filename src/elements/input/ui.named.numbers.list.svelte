<script>
    import notCommon from "../../frame/common";

    import { UIColumns, UIColumn } from "../layout";
    import { UIButton } from "../button";
    import UINumber from "./ui.number.svelte";
    import UITextfield from "../input/ui.textfield.svelte";
    import { UITitle } from "../various";

    /** @type {import('./type').UIInputProps} */
    let {
        fieldname = "numbers_list",
        value = {},
        defaultItemTitle = "",
        defaultItemValue = 0,
        label = "named numbers list",
        labelSize = 5,
        placeholder = "new item",
        readonly = false,
        disabled = false,
        required = true,
        valid = true,
        onchange = () => true,
        class: classes = "",
        ...others
    } = $props();

    const createNewVal = () => {
        return {
            id: defaultItemTitle,
            number: defaultItemValue,
        };
    };

    let newVal = $state(createNewVal());

    const transformObjectToList = () => {
        return Object.keys(value).map((name) => {
            return {
                id: name,
                title: name,
                number: value[name],
            };
        });
    };

    let list = $state(transformObjectToList());

    function remove(id) {
        if (notCommon.objHas(value, id)) {
            delete value[id];
            value = value;
            list = transformObjectToList();
            onchange({ value, field: fieldname });
        }
    }

    function add() {
        const id = newVal.id.trim();
        const number = parseInt(newVal.number);
        if (id && id !== "" && !isNaN(number) && !notCommon.objHas(value, id)) {
            value[id] = number;
        }
        list = transformObjectToList();
        onchange({ value: $state.snapshot(value), field: fieldname });
        newVal = createNewVal();
    }
</script>

<UITitle title={label} size={labelSize} />
{#each list as item (item.id)}
    <UIColumns class={classes} {disabled}>
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
    <UIColumns class={classes}>
        <UIColumn classes="is-6">
            <UITextfield
                bind:value={newVal.id}
                {placeholder}
                required={false}
            />
        </UIColumn>
        <UIColumn classes="is-4">
            <UINumber bind:value={newVal.number} />
        </UIColumn>
        <UIColumn classes="is-2">
            <UIButton icon={"plus"} action={() => add()} />
        </UIColumn>
    </UIColumns>
{/if}
