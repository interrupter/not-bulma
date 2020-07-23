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
  export let multiple = false;
  export let size = 8;
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
  $: multipleClass = multiple?' is-multiple ':'';

  function onBlur(ev){
    let data = {
  		field: fieldname,
  		value: ev.target.value
  	};
    if(multiple){
      value = Array.from(ev.target.selectedOptions).map( el => el.value );
      data.value = value;
    }
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

  function onInput(ev){
  	let data = {
  		field: fieldname,
      value
  	};
    if(multiple){
      value = Array.from(ev.target.selectedOptions).map( el => el.value );
      data.value = value;
    }
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

</script>

<div class="field form-field-select-{fieldname}">
  <label class="label">{label}</label>
  <div class="control {iconClasses}">
    <div class="select {validationClasses} {multipleClass}">
      {#if multiple }
      <select name="{fieldname}" size="{size}" on:blur={onBlur} on:input={onInput} {readonly} multiple >
        {#if placeholder.length > 0 }
        {#if value }
        <option >{placeholder}</option>
        {:else}
        <option selected="selected">{placeholder}</option>
        {/if}
        {/if}
        {#each variants as variant}
        <option value="{variant.id}" selected="{value.indexOf(variant.id) > -1}">{variant.title}</option>
        {/each}
      </select>
      {:else}
      <select name="{fieldname}" bind:value={value} on:blur={onBlur} on:input={onInput} {readonly} >
        {#if placeholder.length > 0 }
        {#if value }
        <option >{placeholder}</option>
        {:else}
        <option selected="selected">{placeholder}</option>
        {/if}
        {/if}
        {#each variants as variant}
        <option value="{variant.id}" selected="{value == variant.id}">{variant.title}</option>
        {/each}
      </select>
      {/if}
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
