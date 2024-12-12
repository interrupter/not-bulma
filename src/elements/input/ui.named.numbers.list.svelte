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
        value = $bindable({}),
        label = "named numbers list",
        placeholder = $bindable("new item"),
        readonly = false,
        onchange = () => true,
    } = $props();

    let list = $derived(
        Object.keys(value).map((name) => {
            return {
                id: name,
                title: name,
                number: value[name],
            };
        })
    );

    function remove(id) {
        if (notCommon.objHas(value, id)) {
            delete value[id];
            value = value;
            onchange({ value, field: fieldname });
        }
    }

    function add() {
        const id = newVal.id.trim();
        const number = parseInt(newVal.number);
        if (id && id !== "" && !isNaN(number) && !notCommon.objHas(value, id)) {
            value[id] = number;
        }
        onchange({ value, field: fieldname });
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
