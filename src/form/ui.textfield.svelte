<script>

import UICommon from '../common.js';

  import {createEventDispatcher} from 'svelte';
	let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let value = '';
  export let label = 'textfield';
  export let placeholder = 'input some text here, please';
  export let fieldname = 'textfield';
  export let icon = false;
  export let required = true;
  export let readonly = false;
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
  		value: ev.target.type === 'checkbox' ? ev.target.checked:ev.target.value
  	};
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

  function onInput(ev){
  	let data = {
  		field: fieldname,
      value
  	};
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

</script>
<div class="field form-field-textfield-{fieldname}">
  <label class="label" for="form-field-textfield-{fieldname}">{label}</label>
  <div class="control {iconClasses}">
    <input id="form-field-textfield-{fieldname}"
    class="input {validationClasses}" type="text" name="{fieldname}" invalid="{invalid}" required={required} placeholder="{placeholder}" bind:value={value} autocomplete="{fieldname}" aria-controls="input-field-helper-{fieldname}"
      on:change={onBlur} on:input={onInput}
      aria-describedby="input-field-helper-{fieldname}" {readonly}/>
    {#if icon }
    <span class="icon is-small is-left"><i class="fas fa-{icon}"></i></span>
    {/if}
    {#if validated === true }
    <span class="icon is-small is-right">
      {#if valid === true }
      <i class="fas fa-check"></i>
      {:else if (valid === false) }
      <i class="fas fa-exclamation-triangle"></i>
      {/if}
    </span>
    {/if}
  </div>
  <p class="help {validationClasses}" id="input-field-helper-{fieldname}">
    {#if !(validated && valid) && (inputStarted) }
    {helper}
    {:else}&nbsp;{/if}
  </p>
</div>
