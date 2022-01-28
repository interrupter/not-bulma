<script>
  import {LOCALE} from '../../locale';
  import UICommon from '../common.js';

  import {createEventDispatcher} from 'svelte';
  let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let value = [];
  export let fieldname = 'checkbox-list';
  export let placeholder = '';
  export let readonly = false;
  export let disabled = false;
  export let valid = true;
  export let validated = false;
  export let errors = false;
  export let formErrors = false;
  export let formLevelError = false;

  $: allErrors = [].concat(errors?errors:[], formErrors?formErrors:[]);
  $: helper = allErrors?allErrors.join(', '): placeholder;
  $: invalid = ((valid === false) || (formLevelError));
  $: validationClasses = (valid === true || !inputStarted)?UICommon.CLASS_OK:UICommon.CLASS_ERR;

  function onBlur(ev){
    let id = parseInt(ev.currentTarget.dataset.id);
    let copy = [...value];
    copy.find(itm => itm.id == id ).value = ev.currentTarget.checked;
    let data = {
      id,
      field: fieldname,
      value: copy,
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

  function onInput(ev){
    let id = parseInt(ev.currentTarget.dataset.id);
    let copy = [...value];
    copy.find(itm => itm.id === id ).value = ev.currentTarget.checked;
    let data = {
      id,
      field: fieldname,
      value: copy,
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

</script>

<div class="control">
  {#each value as item(item.id) }
  <label class="checkbox pr-2" disabled={disabled || item.disabled} for="form-field-checkbox-{fieldname+'_'+item.id}">
    <input
      data-id={item.id}
      id="form-field-checkboxlist-{fieldname+'_'+item.id}"
      type="checkbox"
      bind:checked={item.value}
      placeholder="{item.placeholder}"
      name="{fieldname+'_'+item.id}"
      {readonly}
      invalid="{invalid}"
      on:change={onBlur}
      on:input={onInput}
      aria-controls="input-field-helper-{fieldname+'_'+item.id}"
      aria-describedby="input-field-helper-{fieldname+'_'+item.id}"
      disabled={disabled || item.disabled}
      >
    {$LOCALE[item.label]}
  </label>
  {/each}
</div>
<p class="help {validationClasses}" id="form-field-helper-{fieldname}">
  {#if !(validated && valid) && (inputStarted) }
  {helper}
  {:else}&nbsp;{/if}
</p>
