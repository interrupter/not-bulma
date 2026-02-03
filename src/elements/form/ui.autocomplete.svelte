<script>
    import { run } from "svelte/legacy";

    import { LOCALE } from "../../locale/index";

    import AutoComplete from "simple-svelte-autocomplete";
    import ErrorsList from "../various/ui.errors.list.svelte";
    import UITextfield from "./ui.textfield.svelte";
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
     * @property {boolean} [formLevelError]
     * @property {any} [searchFunction]
     */

    /** @type {Props} */
    let {
        idField = "_id",
        labelField = "title",
        minCharactersToSearch = 3,
        selectFirstIfEmpty = false,
        maxItemsToShowInList = 20,
        noResultsText = "Ничего не найдено",
        showClear = true,
        value = $bindable(),
        placeholder = "",
        fieldname = "checkbox-list",
        disabled = false,
        readonly = false,
        icon = false,
        inputStarted = $bindable(false),
        valid = true,
        validated = false,
        errors = false,
        formErrors = false,
        formLevelError = false,
        searchFunction = (/*term*/) => {
            return [];
        },
        onchange = () => {},
    } = $props();

    let iconClasses = $derived(
        (icon ? " has-icons-left " : "") + " has-icons-right "
    );
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
    let invalid = $derived(valid === false || formLevelError);
    let validationClasses;
    run(() => {
        validationClasses =
            valid === true || !inputStarted
                ? UICommon.CLASS_OK
                : UICommon.CLASS_ERR;
    });

    function onChange() {
        let data = {
            field: fieldname,
            value,
        };

        inputStarted = true;
        onchange(data);
        return true;
    }
</script>

{#if readonly}
    <UITextfield
        value={value ? value.title : ""}
        {fieldname}
        {placeholder}
        {icon}
    />
{:else}
    <div class="control">
        {#if readonly}
            <p>{$LOCALE[value]}</p>
        {:else}
            <AutoComplete
                {showClear}
                {disabled}
                {placeholder}
                {noResultsText}
                {onChange}
                {searchFunction}
                hideArrow={true}
                labelFieldName={labelField}
                valueFieldName={idField}
                {minCharactersToSearch}
                {selectFirstIfEmpty}
                {maxItemsToShowInList}
                bind:selectedItem={value}
            />
        {/if}
    </div>
    <ErrorsList
        bind:errors={allErrors}
        bind:show={showErrors}
        bind:classes={validationClasses}
        id="input-field-helper-{fieldname}"
    />
{/if}
