<script>

  import {CLASS_OK, CLASS_ERR } from './common.js';

  import {createEventDispatcher} from 'svelte';
	let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let validator = ()=>{ return true; }
  export let value = '';
  export let variants = [];
  export let label = 'select';
  export let placeholder = 'empty select item';
  export let fieldname = 'select';
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
  $: validationClasses = (valid===true || !inputStarted)?CLASS_OK:CLASS_ERR;

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

<div class="field form-field-select-{fieldname}">
  <label class="label">{label}</label>
  <div class="control {iconClasses}">
    <div class="select {validationClasses}">
      <select name="{fieldname}" bind:value={value} on:blur={onBlur} on:input={onInput} {readonly}>
        {#if placeholder.length > 0 }
        {#if value }
        <option >{placeholder}</option>
        {:else}
        <option selected="selected">{placeholder}</option>
        {/if}
        {/if}
        {#each variants as variant}
        <option value="{variant.id}" selected="{variant.id==value}">{variant.title}</option>
        {/each}
      </select>
    </div>
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
