<script>

  import UICommon from '../common.js';

  import {createEventDispatcher} from 'svelte';
let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let value = '';
  export let placeholder = 'input some text here, please';
  export let fieldname = 'textarea';
  export let icon = false;
  export let rows = 10;
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

  /*function onInput(ev){
    let data = {
      field: fieldname,
      value: ev.currentTarget.value
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
  }*/

</script>

  <div class="control {iconClasses}">
    <textarea
    id="form-field-textarea-{fieldname}"
    invalid="{invalid}"
    on:blur={onBlur}
    class="textarea {validationClasses}"
    required={required} {readonly}
    bind:value={value}
    name="{fieldname}"
    placeholder="{placeholder}" rows="{rows}"
    aria-controls="input-field-helper-{fieldname}" aria-describedby="input-field-helper-{fieldname}"
    ></textarea>
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
