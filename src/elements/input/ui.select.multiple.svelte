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
     * @property {boolean} [multiple]
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
        multiple = false,
        size = 8,
        valid = true,
        class: classes = "",
        onchange = () => true,
        ...others
    } = $props();

    let selectedVariants = $state([]);

    function filterSelectedVariants(variant) {
        if (Array.isArray(value) && multiple) {
            return value.indexOf(variant.id) > -1;
        } else if (value) {
            return value == variant.id;
        } else {
            return false;
        }
    }

    function onBlur(ev) {
        let data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        if (Array.isArray(data.value) && Array.isArray(value)) {
            if (notCommon.compareTwoArrays(value, data.value)) {
                return true;
            }
        } else {
            if (data.value === value) {
                return true;
            }
        }
        if (multiple) {
            value = Array.from(ev.target.selectedOptions).map((el) => el.value);
            if (value.indexOf(UICommon.CLEAR_MACRO) > -1) {
                value = [];
            }
            data.value = value;
        } else {
            if (data.value === UICommon.CLEAR_MACRO) {
                value = "";
            } else {
                value = data.value;
            }
        }
        onchange(data);
        return true;
    }

    function onInput(ev) {
        let data = {
            field: fieldname,
            value: ev.currentTarget.value,
        };
        if (multiple) {
            value = Array.from(ev.target.selectedOptions).map((el) => el.value);
            if (value.indexOf(UICommon.CLEAR_MACRO) > -1) {
                value = [];
            }
            data.value = value;
        } else {
            if (data.value === UICommon.CLEAR_MACRO) {
                value = "";
            } else {
                value = data.value;
            }
        }
        onchange(data);
        return true;
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
    <div class="select {classes}" class:is-multiple={multiple}>
        <select
            id="form-field-select-{fieldname}"
            name={fieldname}
            oninput={onInput}
            {readonly}
            {required}
            {multiple}
            {invalid}
            size={multiple ? size : false}
            {...others}
        >
            {#if placeholder.length > 0}
                {#if value}
                    <UISelectOption
                        value={UICommon.CLEAR_MACRO}
                        title={placeholder}
                    />
                {:else}
                    <UISelectOption
                        value={UICommon.CLEAR_MACRO}
                        selected="selected"
                        title={placeholder}
                    />
                {/if}
            {/if}
            {#each variants as variant (variant.id)}
                {#if multiple}
                    <UISelectOption
                        value={variant.id}
                        selected={value &&
                            Array.isArray(value) &&
                            value.indexOf(variant.id) > -1}
                        title={variant.title}
                    />
                {:else}
                    <UISelectOption
                        value={variant.id}
                        selected={value == variant.id}
                        title={variant.title}
                    />
                {/if}
            {/each}
        </select>
    </div>
{/if}
