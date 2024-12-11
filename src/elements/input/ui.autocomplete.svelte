<script>
    import AutoComplete from "simple-svelte-autocomplete";

    import { LOCALE } from "../../locale/index";
    import UITextfieldInput from "./ui.textfield.svelte";
    import UICommon from "../common.js";

    /**
     * @typedef {Object} Props
     * @property {string} [idField]
     * @property {string} [labelField]
     * @property {number} [minCharactersToSearch]
     * @property {boolean} [selectFirstIfEmpty]
     * @property {number} [maxItemsToShowInList]
     * @property {string} [noResultsText]
     * @property {boolean} [showClear]
     * @property {any} value
     * @property {string} [placeholder]
     * @property {string} [fieldname]
     * @property {boolean} [disabled]
     * @property {boolean} [readonly]
     * @property {boolean} [icon]
     * @property {boolean} [inputStarted]
     * @property {boolean} [valid]
     * @property {boolean} [validated]
     * @property {boolean} [errors]
     * @property {boolean} [formErrors]
     * @property {any} [searchFunction]
     */

    /** @type {Props} */
    let {
        //generic input props
        value = $bindable(),
        placeholder = "",
        fieldname = "checkbox-list",
        disabled = false,
        readonly = false,
        valid = true,
        onchange = () => true,
        ...others
    } = $props();

    let invalid = $derived(!valid);
    const oninput = UICommon.onInput(fieldname, onchange);
</script>

{#if disabled}
    <UITextfieldInput
        value={value ? value.title : ""}
        {fieldname}
        {placeholder}
        {icon}
    />
{:else if readonly}
    <p>{value ? value.title : ""}</p>
{:else}
    <AutoComplete
        bind:selectedItem={value}
        onChange={oninput}
        {valid}
        {invalid}
        {required}
        placeholder={$LOCALE[placeholder]}
        {...others}
    />
{/if}
