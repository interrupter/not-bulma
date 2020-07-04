<script>
	import 'bulma-switch';
  import {CLASS_OK, CLASS_ERR } from './common.js';

  import {createEventDispatcher} from 'svelte';
	let dispatch = createEventDispatcher();

  export let inputStarted = false;
  export let validator = ()=>{ return true; }
  export let value = '';
  export let label = 'textfield';
  export let placeholder = 'input some text here, please';
  export let fieldname = 'textfield';
  export let icon = false;
  export let required = true;
  export let disabled = false;
  export let valid = true;
  export let styling = " is-rounded is-success "
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

<div class="field form-field-switch-{fieldname}">
  <div class="control">
      <input type="checkbox"
        class="switch {styling}"
        id="edit-form-switch-{fieldname}"
        bind:checked={value}
        placeholder="{placeholder}"
        name="{fieldname}"
        required={required}
        invalid="{invalid}"
        on:blur={onBlur} on:input={onInput}
        aria-controls="input-field-helper-{fieldname}"
        aria-describedby="input-field-helper-{fieldname}"
        disabled={disabled} />
				<label class="label" for="edit-form-switch-{fieldname}">{label}</label>
  </div>
  <p class="help {validationClasses}" id="form-field-helper-{fieldname}">
    {#if !(validated && valid) && (inputStarted) }
    {helper}
    {:else}&nbsp;{/if}
  </p>
</div>
