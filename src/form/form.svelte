<script>
	import UIField from './field.svelte';
	import 'bulma-pageloader';

	import {
	  FIELDS,
	  VARIANTS
	} from './LIB.js';

	import {
	  onMount,
	  createEventDispatcher
	} from 'svelte';

	let dispatch = createEventDispatcher();

	let form = {};
	let validate = () => {
	  return {
	    clean: true
	  };
	};



	let formErrors = [];
	let formHasErrors = false;
	let fieldsHasErrors = false;
	let success = false;

	$: formInvalid = formHasErrors || fieldsHasErrors;

	function fieldInit(type, mutation = {}) {
	  let field = {
	    label: '',
	    placeholder: '',
	    enabled: true,
	    visible: true,
	    required: true,
	    validated: false,
	    valid: false,
	    errors: false,
	    variants: []
	  };
	  if (FIELDS.contains(type)) {
	    field = {...field, ...FIELDS.get(type)};
	  }
	  if (mutation) {
	    field = {...field, ...mutation};
	  }
	  if (
	    Object.prototype.hasOwnProperty.call(field, 'variantsSource') &&
			VARIANTS.contains(field.variantsSource)
	  ) {
	    field.variants = VARIANTS.get(field.variantsSource);
	  }
	  return field;
	}

	export function collectData() {
	  let result = {};
	  fields.flat().forEach((fieldname) => {
	    if (Object.prototype.hasOwnProperty.call(form, fieldname) && form[fieldname].enabled && form[fieldname].visible) {
	      if(typeof form[fieldname].value !== 'undefined'){
	        result[fieldname] = form[fieldname].value;
	      }
	    }
	  });
	  return result;
	}

	export function setFieldInvalid(fieldName, value, errors) {
	  form[fieldName].errors = errors;
	  form[fieldName].validated = true;
	  form[fieldName].valid = false;
	  form[fieldName].value = value;
	  form = form;
	  fieldsHasErrors = true;
	}

	export function setFieldValid(fieldName, value) {
	  form[fieldName].errors = false;
	  form[fieldName].validated = true;
	  form[fieldName].valid = true;
	  form[fieldName].value = value;
	  let some = false;
	  for (let fname in form) {
	    if (fname !== fieldName) {
	      if (Array.isArray(form[fname].errors) && form[fname].errors.length === 0) {
	        form[fname].errors = false;
	      }
	      if (form[fname].errors !== false) {
	        some = true;
	        break;
	      }
	    }
	  }
	  form = form;
	  if (fieldsHasErrors !== some) {
	    fieldsHasErrors = some;
	  }
	}

	export function fieldIsValid(fieldName) {
	  return !Array.isArray(form[fieldName].errors);
	}

	export function setFormFieldInvalid(fieldName, errors) {
	  form[fieldName].formErrors = [...errors];
	  form[fieldName].validated = true;
	  form[fieldName].inputStarted = true;
	  form[fieldName].valid = false;
	  form[fieldName].formLevelError = true;
	  form = form;
	}

	export function setFormFieldValid(fieldName) {
	  form[fieldName].formErrors = false;
	  form[fieldName].validated = true;
	  form[fieldName].valid = true;
	  form[fieldName].formLevelError = false;
	  form = form;
	}

	export function fieldErrorsNotChanged(fieldName, errs) {
	  let oldErrs = form[fieldName].errors;
	  if (oldErrs === false && errs === false) {
	    return true;
	  } else {
	    if (Array.isArray(oldErrs) && Array.isArray(errs)) {
	      return (oldErrs.join('. ')) === (errs.join('. '));
	    } else {
	      return false;
	    }
	  }
	}

	function initFormByField(fieldName) {
	  if (Array.isArray(fieldName)) {
	    fieldName.forEach(initFormByField);
	  } else {
	    let opts = {};
	    if (Object.prototype.hasOwnProperty.call(options, 'fields')) {
	      if (Object.prototype.hasOwnProperty.call(options.fields, fieldName)) {
	        opts = options.fields[fieldName];
	      }
	    }
	    form[fieldName] = fieldInit(fieldName, opts);
	    if (options.readonly) {
	      form[fieldName].readonly = true;
	    }
	  }
	}

	onMount(() => {
	  initFormByField(fields);
	  if (Object.prototype.hasOwnProperty.call(options, 'validate') && typeof options.validate === 'function') {
	    validate = options.validate;
	  }
	  form = form;
	});

	export function addFormError(err) {
	  if (Array.isArray(formErrors)) {
	    if (!formErrors.includes(err)) {
	      formErrors.push(err);
	    }
	  } else {
	    formErrors = [err];
	  }
	  formHasErrors = true;
	}

	/*function removeFormErrors(err) {
	  if (Array.isArray(formErrors)) {
	    formErrors.splice(0, formErrors.length);
	    formErrors = formErrors;
	  } else {
	    formErrors = false;
	  }
	}*/

	function onFieldChange(ev) {
	  let data = ev.detail;
	  if (validation) {
	    //fields level validations
	    let res = typeof form[data.field].validate === 'function' ? form[data.field].validate(data.value) : [];
	    if (res.length === 0) {
	      setFieldValid(data.field, data.value);
	    } else {
	      setFieldInvalid(data.field, data.value, res);
	    }
	    //form level validations
	    let errors = validate(collectData());
	    if ((!errors) || errors.clean) {
	      formHasErrors = false;
	      dispatch('change', data);
	    } else {
	      if ((errors.form.length === 0) && Object.keys(errors.fields).length === 0) {
	        formHasErrors = false;
	        for (let fieldName in fields.flat()) {
	          setFormFieldValid(fieldName);
	        }
	        dispatch('change', data);
	      } else {
	        if (errors.form.length) {
	          errors.form.forEach(addFormError);
	        } else {
	          formErrors = false;
	        }
	        for (let fieldName of fields.flat()) {
	          if (Object.prototype.hasOwnProperty.call(errors.fields, fieldName)) {
	            setFormFieldInvalid(fieldName, errors.fields[fieldName]);
	          } else {
	            setFormFieldValid(fieldName);
	          }
	        }
	      }
	    }
	  } else {
	    dispatch('change', data);
	  }
	}

	export let fields = [];

	export let options = {};
	export let validation = true;
	export let SUCCESS_TEXT = 'Операция завершена';
	export let WAITING_TEXT = 'Отправка данных на сервер';

	export let title = 'Форма';
	export let description = 'Заполните пожалуйста форму';

	export let submit = {
	  caption: 'Отправить',
	  enabled: true
	};

	export let cancel = {
	  caption: 'Назад',
	  enabled: true
	};

	export let loading = false;

	export let submitForm = (e) => {
	  e && e.preventDefault();
	  dispatch('submit', collectData());
	  return false;
	};

	export function showSuccess() {
	  success = true;
	}

	export let rejectForm = () => {
	  loading = true;
	  dispatch('reject');
	};

	export function setLoading() {
	  loading = true;
	}

	export function resetLoading() {
	  loading = false;
	}

	export function setFieldsVisibility(fieldsList, val){
	  if(Array.isArray(fieldsList)){
	    Object.keys(form).forEach(fieldName => {
	      form[fieldName].visible = fieldsList.includes(fieldName)?val:!val;
	    });
	    form=form;
	  }
	}

	export function setVisibleFields(fieldsList){
	  setFieldsVisibility(fieldsList, true);
	}

	export function setInvisibleFields(fieldsList){
	  setFieldsVisibility(fieldsList, false);
	}

	export function setFieldValue(fieldName, value){
	  if(Object.prototype.hasOwnProperty.call(form, fieldName)){
	    form[fieldName].value = value;
	    form = form;
	    onFieldChange({detail:{field:fieldName, value}});
	  }
	}

</script>

<div class="pageloader {loading?'is-active':''}"><span class="title">{WAITING_TEXT}</span></div>

{#if success}
<div class="notification is-success">
	<h3 class="form-success-message">{SUCCESS_TEXT}</h3>
</div>
{:else}
{#if title }
<h5 class="title is-5">{title}</h5>
{/if}
{#if description }
<h6 class="subtitle is-6">{description}</h6>
{/if}

{#if options.buttonsFirst }
<div class="buttons is-grouped is-centered">
	{#if cancel.enabled}
	<button class="button is-outlined {cancel.classes}" on:click={rejectForm}>{cancel.caption}</button>
	{/if}
	{#if submit.enabled}
	<button on:click={submitForm} disabled={formInvalid} class="button is-primary is-hovered {submit.classes}">{submit.caption}</button>
	{/if}
</div>

{#if formErrors.length > 0 }
<div class="edit-form-error notification is-danger">{formErrors.join(', ')}</div>
{/if}

{/if}

{#each fields as field}
{#if Array.isArray(field) }
<div class="columns">
	{#each field as subfield }
	{#if form[subfield] && form[subfield].component }
	{#if form[subfield].visible }
	<div class="column {form[subfield].fieldSize?('is-'+form[subfield].fieldSize):''} ">
		<UIField
			controls={[form[subfield]]}
			on:change={onFieldChange}
			name={subfield}
			horizontal={options.horizontal}
			label={form[subfield].label}
			/>
	</div>
	{/if}
	{:else}
	<div class="column notification is-danger">Subfield '{subfield}' is not registered</div>
	{/if}
	{/each}
</div>
{:else }
{#if form[field] && form[field].component }
{#if form[field].visible}
<UIField
	controls={[form[field]]}
	on:change={onFieldChange}
	name={field}
	horizontal={options.horizontal}
	label={form[field].label}
	/>
{/if}
{:else}
<div class="notification is-danger">Field '{field}' is not registered</div>
{/if}
{/if}
{/each}

{#if !options.buttonsFirst }
{#if formErrors.length > 0 }
<div class="edit-form-error notification is-danger">{formErrors.join(', ')}</div>
{/if}
<div class="buttons is-grouped is-centered">
	{#if cancel.enabled}
	<button class="button is-outlined {cancel.classes}" on:click={rejectForm}>{cancel.caption}</button>
	{/if}
	{#if submit.enabled}
	<button on:click={submitForm} disabled={formInvalid} class="button is-primary is-hovered {submit.classes}">{submit.caption}</button>
	{/if}
</div>
{/if}
{/if}
