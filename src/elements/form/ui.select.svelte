<script>
  import {LOCALE} from '../../locale';
  import UICommon from '../common.js';
  const CLEAR_MACRO = '__CLEAR__';

  import {createEventDispatcher} from 'svelte';
  let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let value = '';
  export let variants = [];
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
  $: validationClasses = (valid===true || !inputStarted)?UICommon.CLASS_OK:UICommon.CLASS_ERR;
  $: multipleClass = multiple?' is-multiple ':'';

  function onBlur(ev){
    let data = {
      field: fieldname,
      value: ev.currentTarget.value
    };
    if(multiple){
      value = Array.from(ev.target.selectedOptions).map( el => el.value );
      if(value.indexOf(CLEAR_MACRO)>-1){
        value = [];
      }
      data.value = value;
    }else{
      if (data.value === CLEAR_MACRO){
        value = '';
      }
    }
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

  function onInput(ev){
    let data = {
      field: fieldname,
      value: ev.currentTarget.value
    };
    if(multiple){
      value = Array.from(ev.target.selectedOptions).map( el => el.value );
      if(value.indexOf(CLEAR_MACRO)>-1){
        value = [];
      }
      data.value = value;
    }else{
      if (data.value === CLEAR_MACRO){
        value = '';
      }
    }
    inputStarted = true;
    dispatch('change', data);
    return true;
  }

</script>

  <div class="control {iconClasses}">
    <div class="select {validationClasses} {multipleClass}">
      {#if multiple }
      <select
        id="form-field-select-{fieldname}"
        name="{fieldname}" size="{size}"
        on:blur={onBlur} on:input={onInput} {readonly} {required} multiple >
        {#if placeholder.length > 0 }
        {#if value }
        <option value="{CLEAR_MACRO}" >{$LOCALE[placeholder]}</option>
        {:else}
        <option value="{CLEAR_MACRO}" selected="selected">{$LOCALE[placeholder]}</option>
        {/if}
        {/if}
        {#each variants as variant}
        <option value="{variant.id}" selected="{value && value.indexOf(variant.id) > -1}">{$LOCALE[variant.title]}</option>
        {/each}
      </select>
      {:else}
      <select id="form-field-select-{fieldname}"
        name="{fieldname}" bind:value={value} on:blur={onBlur} on:input={onInput} {readonly} >
        {#if placeholder.length > 0 }
        {#if value }
        <option value="{CLEAR_MACRO}">{$LOCALE[placeholder]}</option>
        {:else}
        <option value="{CLEAR_MACRO}" selected="selected">{$LOCALE[placeholder]}</option>
        {/if}
        {/if}
        {#each variants as variant}
        <option value="{variant.id}" selected="{value == variant.id}">{$LOCALE[variant.title]}</option>
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
