<script>
    import { LOCALE } from "../../locale";
    import UISelectOption from "./ui.select.option.svelte";

    import UICommon from "../common";
    import notCommon from "../../frame/common";

    /**
     * @typedef {Object} Props
     * @property {string} [value = []]
     * @property {any}      [variants = []]
     * @property {string} [placeholder = ""]
     * @property {boolean}  [emptyValueEnabled = true]
     * @property {string|number}  [emptyValue]
     * @property {string} [emptyValueTitle = "no-selection"]
     * @property {string} [fieldname="select-multiple"]
     * @property {boolean} [required = true]
     * @property {boolean} [readonly = false]
     * @property {number} [rows = 8]
     * @property {string} [color]
     * @property {string} [size]
     * @property {boolean} [valid = true]
     * @property {string}   [class = ""]
     * @property {function} [onchange = ({value:array of string|number, field:string, variants:array of object})=>true]
     */

    /** @type {Props} */
    let {
        value = [],
        variants = [],
        placeholder = "",
        emptyValueTitle = "no-selection",
        emptyValueEnabled = true,
        emptyValue,
        fieldname = "select-multiple",
        required = true,
        readonly = false,
        rows = 8,
        color,
        size,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

    let lastValue = $state.snapshot(value);

    function isClearValueMacro(plainValue) {
        return plainValue.includes(UICommon.CLEAR_MACRO);
    }

    function getSelectedOptionsValues(ev) {
        return Array.from(ev.selectedOptions).map((el) =>
            typeof el.__value !== "undefined" ? el.__value : el.value
        );
    }

    function getEmptyValue() {
        return typeof emptyValue === "undefined"
            ? UICommon.CLEAR_MACRO
            : emptyValue;
    }

    function idToVariant(id) {
        return variants.find((variant) => variant.id == id);
    }

    function valueIdsToVariants() {
        const ev = getEmptyValue();
        return value.filter((id) => id !== ev).map(idToVariant);
    }

    function onInput(ev) {
        let selectedIds = getSelectedOptionsValues(ev.currentTarget);
        if (isClearValueMacro(selectedIds)) {
            selectedIds = [];
        }
        const newValue = selectedIds;
        value = selectedIds;
        if (notCommon.compareTwoArrays(newValue, lastValue)) {
            return;
        }
        lastValue = newValue;
        onchange({
            value: newValue,
            field: fieldname,
            variants: valueIdsToVariants(),
        });
    }

    let selectedVariants = $derived(
        value && Array.isArray(value) ? valueIdsToVariants(value) : []
    );

    let invalid = $derived(!valid);
    let UI_CLASSES = $derived(
        [size, color]
            .filter((val) => val)
            .map((val) => `is-${val}`)
            .join(" ")
    );
</script>

{#if readonly}
    {#if value && Array.isArray(value) && value.length}
        {#each selectedVariants as selectedVariant}
            <span class="mr-2">{$LOCALE[selectedVariant.title]}</span>
        {/each}
    {:else if emptyValueEnabled}
        <span class="mr-2">{$LOCALE[emptyValueTitle]}</span>
    {/if}
{:else}
    <div class="select is-multiple {UI_CLASSES} {classes} ">
        <select
            multiple="true"
            id="form-field-select-{fieldname}"
            name={fieldname}
            oninput={onInput}
            onchange={onInput}
            onblur={onInput}
            {value}
            {readonly}
            {required}
            {invalid}
            size={rows}
            {...others}
        >
            {#if emptyValueEnabled}
                <UISelectOption
                    value={typeof emptyValue === "undefined"
                        ? UICommon.CLEAR_MACRO
                        : emptyValue}
                    title={emptyValueTitle}
                />
            {/if}
            {#each variants as variant (variant.id)}
                <UISelectOption value={variant.id} title={variant.title} />
            {/each}
        </select>
    </div>
{/if}
