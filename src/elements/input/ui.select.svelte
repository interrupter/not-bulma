<script>
    import { LOCALE } from "../../locale";
    import UISelectOption from "./ui.select.option.svelte";

    import UICommon from "../common";
    import notCommon from "../../frame/common";

    /**
     * @typedef {Object} Props
     * @property {string} [value]
     * @property {any}      [variants]
     * @property {string} [placeholder]
     * @property {string} [emptyValueTitle]
     * @property {string} [fieldname]
     * @property {boolean} [required]
     * @property {boolean} [readonly]
     * @property {number} [size]
     * @property {boolean} [valid]
     */

    /** @type {Props} */
    let {
        value = $bindable(""),
        variants = [],
        placeholder = "",
        emptyValueTitle = "",
        fieldname = "select",
        required = true,
        readonly = false,
        size,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

    let selectedVariants = $state([]);

    function filterSelectedVariants(variant) {
        if (value) {
            return value == variant.id;
        } else {
            return false;
        }
    }

    function checkOnClearMacro(newValue) {
        if (newValue === UICommon.CLEAR_MACRO) {
            value = "";
        } else {
            value = newValue;
        }
    }

    function alreadyProcessed(newValue) {
        if (Array.isArray(newValue) && Array.isArray(value)) {
            if (notCommon.compareTwoArrays(value, newValue)) {
                return true;
            }
        } else {
            if (newValue === value) {
                return true;
            }
        }
        return false;
    }

    function onInput(ev) {
        const data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        if (alreadyProcessed(data.value)) {
            return;
        }
        checkOnClearMacro(data.value);
        onchange(data);
    }

    $effect(() => {
        selectedVariants = Array.isArray(variants)
            ? variants.filter(filterSelectedVariants)
            : [];
    });

    let invalid = $derived(!valid);
</script>

{#if readonly}
    {#if value}
        {#each selectedVariants as selectedVariant}
            <span class="mr-2">{$LOCALE[selectedVariant.title]}</span>
        {/each}
    {:else}
        <span class="mr-2">{$LOCALE[emptyValueTitle]}</span>
    {/if}
{:else}
    <div class="select {classes}">
        <select
            id="form-field-select-{fieldname}"
            name={fieldname}
            oninput={onInput}
            onblur={onInput}
            {readonly}
            {required}
            {invalid}
            {size}
            {...others}
        >
            {#if placeholder.length > 0}
                <UISelectOption
                    value={UICommon.CLEAR_MACRO}
                    selected={!value}
                    title={placeholder}
                />
            {/if}
            {#each variants as variant (variant.id)}
                <UISelectOption
                    value={variant.id}
                    selected={value == variant.id}
                    title={variant.title}
                />
            {/each}
        </select>
    </div>
{/if}
