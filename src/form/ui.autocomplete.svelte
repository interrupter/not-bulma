<script>
  import UITextfield from './ui.textfield.svelte';
  import AutoComplete from 'simple-svelte-autocomplete';

  import UICommon from '../common.js';
  import {
    createEventDispatcher
  } from 'svelte';
  let dispatch = createEventDispatcher();

  export let idField = '_id';
  export let labelField = 'title';
  export let minCharactersToSearch = 3;
  export let selectFirstIfEmpty = false;
  export let maxItemsToShowInList = 20;
  export let noResultsText = 'Ничего не найдено';
  export let showClear = true;

  export let value;

  export let placeholder = '';
  export let fieldname = 'checkbox-list';
  export let disabled = false;
  export let readonly = false;
  export let icon = false;

  export let inputStarted = false;
  export let valid = true;
  export let validated = false;
  export let errors = false;
  export let formErrors = false;
  export let formLevelError = false;

  export let searchFunction = (/*term*/)=>{return [];};

  $: iconClasses = (icon? ' has-icons-left ':'') + ' has-icons-right ';
  $: allErrors = [].concat(errors ? errors : [], formErrors ? formErrors : []);
  $: helper = allErrors ? allErrors.join(', ') : placeholder;
  $: invalid = ((valid === false) || (formLevelError));
  $: validationClasses = (valid === true || !inputStarted) ? UICommon.CLASS_OK : UICommon.CLASS_ERR;

  function onChange() {
    let data = {
      field: fieldname,
      value,
    };

    inputStarted = true;
    dispatch('change', data);
    return true;
  }

</script>

{#if readonly }
  <UITextfield value={value?value.title:''} {fieldname} {placeholder} {icon} />
{:else}
<div class="control">
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
</div>
{#if !(validated && valid) && (inputStarted) }
<p class="help {validationClasses}" id="input-field-helper-{fieldname}">
  {helper}
</p>
{/if}
{/if}
