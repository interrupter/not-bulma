<script>

  import UICommon from '../common.js';
  import ErrorsList from '../various/ui.errors.list.svelte';

  import {createEventDispatcher} from 'svelte';
  let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let value = '';
  export let placeholder = '';
  export let fieldname = 'email';
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
  $: showErrors = (!(validated && valid) && (inputStarted));
  $: invalid = ((valid===false) || (formLevelError));
  $: validationClasses = (valid===true || !inputStarted)?UICommon.CLASS_OK:UICommon.CLASS_ERR;

  function onBlur(ev){
    let data = {
      field: fieldname,
      value: ev.currentTarget.value
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

  function onInput(ev){
    let data = {
      field: fieldname,
      value: ev.currentTarget.value
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

</script>


  <div class="control {iconClasses}">
    {#if readonly }
    <p>{value}</p>
    {:else}
    <input class="input {validationClasses}"
      id="form-field-email-{fieldname}"
      type="email" name="{fieldname}"
      {invalid}
      {required}
      {readonly}
      {disabled}
      placeholder="{placeholder}"
      bind:value={value} autocomplete="{fieldname}"
      aria-controls="input-field-helper-{fieldname}"
      on:change={onBlur} on:input={onInput}
      aria-describedby="input-field-helper-{fieldname}" />
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
    {/if}
  </div>
  <ErrorsList
    bind:errors={allErrors}
    bind:show={showErrors}
    bind:classes={validationClasses}
    id="input-field-helper-{fieldname}"
    />
