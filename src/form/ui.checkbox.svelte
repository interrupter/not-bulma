<script>

  import UICommon from '../common.js';

  import {createEventDispatcher} from 'svelte';
let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let value = false;
  export let label = 'checkbox';
  export let placeholder = 'checkbox placeholder';
  export let fieldname = 'checkbox';
  export let icon = false;
  export let required = true;
  export let readonly = false;
  export let disabled = false;
  export let valid = true;
  export let validated = false;
  export let errors = false;
  export let formErrors = false;
  export let formLevelError = false;

  $: iconClasses = (icon? ' has-icons-left ':'') + ' has-icons-right ';
  $: allErrors = [].concat(errors?errors:[], formErrors?formErrors:[]);
  $: helper = allErrors?allErrors.join(', '): placeholder;
  $: invalid = ((valid===false) || (formLevelError));
  $: validationClasses = (valid===true || !inputStarted)?UICommon.CLASS_OK:UICommon.CLASS_ERR;

  function onBlur(ev){
    let data = {
      field: fieldname,
      value: ev.currentTarget.type==='checkbox'?ev.currentTarget.checked: value
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

  function onInput(ev){
    let data = {
      field: fieldname,
      value: ev.currentTarget.type === 'checkbox'?ev.currentTarget.checked: value
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

</script>

<div class="control {iconClasses}">
  <label class="checkbox" disabled={disabled} for="form-field-checkbox-{fieldname}">
    <input type="checkbox" id="form-field-checkbox-{fieldname}" bind:checked={value} placeholder="{placeholder}" name="{fieldname}" required={required} {readonly} invalid="{invalid}" on:change={onBlur} on:input={onInput} aria-controls="input-field-helper-{fieldname}"
      aria-describedby="input-field-helper-{fieldname}" disabled={disabled}>
    {label}
  </label>
</div>
<p class="help {validationClasses}" id="form-field-helper-{fieldname}">
  {#if !(validated && valid) && (inputStarted) }
  {helper}
  {:else}&nbsp;{/if}
</p>
