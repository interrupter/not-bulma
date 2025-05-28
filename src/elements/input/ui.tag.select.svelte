<script>
    import { LOCALE } from "../../locale";
    import { UIColumn, UIColumns } from "../layout";
    import UISelectOption from "./ui.select.option.svelte";
    import UIButton from "../button/ui.button.svelte";
    import { onMount } from "svelte";

    onMount(() => {
        clearValueFromDeadVariants();
    });

    /**
     * @typedef {Object} Props
     * @property {string} [LC_ADD = "not-node:add_label"]
     * @property {string} [LC_SELECT_FROM_LIST = "not-node:select_from_list_label"]
     * @property {array<string|number>} [value] - list of item ids
     * @property {array<object>} [variants]
     * @property {string} [fieldname = 'tag']
     * @property {boolean} [readonly = false] - export let required = true;
     * @property {boolean} [valid = true]
     * @property {function} [beforeAdd]
     * @property {function} [getItemId]
     * @property {function} [getItemTitle]
     * @property {function} [getItemType]
     * @property {function} [buildItem]
     */

    /** @type {Props} */
    let {
        LC_ADD = "not-node:add_label",
        LC_SELECT_FROM_LIST = "not-node:select_from_list_label",
        value = $bindable([]),
        variants = [],
        fieldname = "tag",
        readonly = false,
        valid = true,
        beforeAdd = (/*variant, variants*/) => {
            return true;
        },
        getItemId = (variant) => {
            return variant.id;
        },
        getItemTitle = (variant) => {
            return variant.title;
        },
        //eslint-disable-next-line no-unused-vars
        getItemType = (variant) => {
            return variant?.type ?? "info";
        },
        buildItem = (variant) => {
            return {
                id: getItemId(variant),
                title: getItemTitle(variant),
                type: getItemType(variant),
            };
        },
        class: classes = "",
        onchange,
    } = $props();

    function variantIdToVariant(id) {
        return variants.find((variant) => getItemId(variant) == id);
    }

    function changeEvent() {
        onchange({
            field: fieldname,
            value,
        });
    }

    function remove(e) {
        e && e.preventDefault();
        let id = e.currentTarget.dataset.id;
        if (value.includes(id)) {
            value.splice(value.indexOf(id), 1);
            value = value;
            changeEvent();
        }
        return false;
    }

    function add(e) {
        e && e.preventDefault();
        let id = e.currentTarget.parentNode.querySelector("select").value;
        const variant = variantIdToVariant(id);
        if (!variant) {
            return false;
        }
        if (!beforeAdd(variant, variants)) {
            return false;
        }
        if (id && value.indexOf(id) === -1) {
            value.push(id);
            value = value;
            changeEvent();
        }
        return false;
    }

    function clearValueFromDeadVariants() {
        value = value.filter(variantIdToVariant);
        return value;
    }

    /*
item = {
  id,        //unique
  title,     //some text
  type       //for coloring items, usual html template names danger, success, etc
}
*/
    let items = $derived(
        value
            .map(variantIdToVariant)
            .filter((variant) => variant)
            .map(buildItem)
    );
</script>

<UIColumns class={classes}>
    <UIColumn>
        {#each items as item (item.id)}
            <span class="mx-1 tag is-{item.type}"
                >{$LOCALE[item.title]}
                {#if !readonly}
                    <button
                        aria-label="delete button"
                        data-id={item.id}
                        class="delete is-small"
                        onclick={remove}
                    ></button>
                {/if}
            </span>
        {/each}
    </UIColumn>

    {#if !readonly}
        <UIColumn>
            <div class="select is-small">
                <select>
                    <UISelectOption
                        value={-1}
                        selected={true}
                        title={LC_SELECT_FROM_LIST}
                    />
                    {#each variants as variant}
                        <UISelectOption
                            value={variant.id}
                            title={variant.title}
                        />
                    {/each}
                </select>
            </div>
            <UIButton
                color={"primary"}
                size={"small"}
                action={add}
                title={LC_ADD}
            />
        </UIColumn>
    {/if}
</UIColumns>
