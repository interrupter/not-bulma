<script>
    import AutoComplete from "simple-svelte-autocomplete";

    import { LOCALE } from "../../locale/index";
    import UITextfieldInput from "./ui.textfield.svelte";
    import UICommon from "../common.js";

    /**
     * More properties at https://github.com/pstanoev/simple-svelte-autocomplete#properties
     * @typedef {Object} Props
     * @property {any} value
     * @property {string} [placeholder = '']
     * @property {string} [fieldname = 'autocomplete']
     * @property {boolean} [disabled = false]
     * @property {boolean} [readonly = false]
     * @property {boolean} [required = false]
     * @property {boolean} [valid = true]
     * @property {function} [onchange]
     */

    /** @type {Props} */
    let {
        //generic input props
        value = $bindable(),
        placeholder = "",
        fieldname = "autocomplete",
        disabled = false,
        readonly = false,
        required = false,
        valid = true,
        onchange = () => true,
        ...others
    } = $props();

    let invalid = $derived(!valid);
    function onChange(val) {
        if (onchange) {
            onchange({
                value: $state.snapshot(val),
                field: fieldname,
            });
        }
    }
</script>

{#if disabled}
    <UITextfieldInput
        value={value ? value.title : ""}
        {fieldname}
        {placeholder}
        {...others}
    />
{:else if readonly}
    <p>{value ? (value?.title ?? "") : ""}</p>
{:else}
    <AutoComplete
        bind:selectedItem={value}
        {onChange}
        placeholder={$LOCALE[placeholder]}
        {valid}
        {invalid}
        {required}
        {...others}
    />
{/if}
