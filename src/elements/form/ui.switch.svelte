<script>
  import {LOCALE} from '../../locale';
  import 'bulma-switch';
  import UICommon from '../common.js';

  import {createEventDispatcher} from 'svelte';
  let dispatch = createEventDispatcher();

export let inputStarted = false;
export let value = false;
export let label = 'textfield';
export let placeholder = 'input some text here, please';
export let fieldname = 'textfield';
export let icon = false;
export let required = true;
export let readonly = false;
export let disabled = false;
export let valid = true;
export let styling = " is-rounded is-success ";
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
      value: ev.currentTarget.type === 'checkbox' ? ev.currentTarget.checked:value
    };
    inputStarted = true;
    dispatch('change', data);
    return true;
}

</script>

  <div class="control">
      <input type="checkbox"
        class="switch {styling}"
        id="form-field-switch-{fieldname}"
        bind:checked={value}
        placeholder="{placeholder}"
        name="{fieldname}"
        {disabled} {required} {readonly}
        invalid="{invalid}"
        on:blur={onBlur} on:input={onInput}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
         />
        <label class="label" for="form-field-switch-{fieldname}">{$LOCALE[label]}</label>
  </div>
  <p class="help {validationClasses}" id="form-field-helper-{fieldname}">
    {#if !(validated && valid) && (inputStarted) }
    {helper}
    {:else}&nbsp;{/if}
  </p>
