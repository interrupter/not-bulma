<script>
	import 'bulma-pageloader';
	import {
	  createEventDispatcher
	} from 'svelte';
	let dispatch = createEventDispatcher();

	import Lib from '../../lib.js';

	import {
	  LOCALE
	} from '../../../locale';

	import UIField from './field.svelte';
	import FormHelpers from './form.helpers.js';

	//validation status
	let formErrors = [];
	let formHasErrors = false;
	let fieldsHasErrors = false;
	let success = false;

	//input data
	//form structure object
	/**
	* {
	* 	[fieldName: string] => description: object
	* }
	**/
	export let form = {};
	//state if form loading
	export let loading = false;
	//hidden - no loader
	//container - parent container of form
	//page - whole page
	export let loader = 'container';
	//fields list structure
	/**
	* each item is a row
	* if item is array, then there few fields in a row
	* [
	* [name, age],
	* [email, telephone]
	* bio,
	* agreed
	*	]
	**/
	export let fields = [];
	//form result labels
	export let SUCCESS_TEXT = 'Операция завершена';
	export let WAITING_TEXT = 'Отправка данных на сервер';

	//form labels
	export let title = 'Форма';
	export let description = 'Заполните пожалуйста форму';
	//if you want button on top
	export let buttonsFirst = false;
	//if form fields should have horizontal layout
	export let horizontal = false;
	//buttons labels and availability
	export let submit = {
	  caption: 'Отправить',
	  enabled: true
	};

	export let cancel = {
	  caption: 'Назад',
	  enabled: true
	};

	$: formInvalid = formHasErrors || fieldsHasErrors;

	export function collectData() {
	  return FormHelpers.collectData(fields, form);
	}

	export function setFieldInvalid(fieldName, value, errors) {
		form = FormHelpers.setFieldInvalid(form, fieldName, value, errors);
	  fieldsHasErrors = true;
	}

	export function setFieldValid(fieldName, value) {
	  form = FormHelpers.setFieldValid(form, fieldName, value);
	  if (fieldsHasErrors !== some) {
	    fieldsHasErrors = some;
	  }
	}

	export function isFieldValid(fieldName) {
	  return FormHelpers.isFieldValid(form, fieldName);
	}

	export function setFormFieldInvalid(fieldName, errors) {
	  form = FormHelpers.setFormFieldInvalid(form, fieldName, errors);
	  dispatch(`field.invalid`, {
	    fieldName
	  });
	}

	export function setFormFieldValid(fieldName) {
	  form = FormHelpers.setFormFieldValid(form, fieldName);
	  dispatch(`field.valid`, {
	    fieldName
	  });
	}

	export function updateFormValidationStatus(
		validationStatus /* FormValidationSession.getCompleteResult() */
	) {
		formHasErrors = false;
		fieldsHasErrors = false;
		if (Array.isArray(validationStatus.form) && validationStatus.form.length) {
			formErrors.splice(0, formErrors.length, ...validationStatus.form);
			formHasErrors = true;
		} else {
			formErrors.splice(0, formErrors.length);
		}
		formErrors = formErrors;
		if (validationStatus.fields) {
			for (let fieldName of Object.keys(form)) {
				if (Array.isArray(validationStatus.fields[fieldName]) && validationStatus.fields[fieldName].length) {
					FormHelpers.setFormFieldInvalid(form, fieldName, validationStatus.fields[fieldName]);
					fieldsHasErrors = true;
				} else {
					FormHelpers.setFormFieldValid(form, fieldName);
				}
			}
		}
	}

	export function showSuccess() {
	  success = true;
	}

	export function setLoading() {
	  loading = true;
	}

	export function resetLoading() {
	  loading = false;
	}

	export function setFieldsVisibility(fieldsList, val) {
	  if (FormHelpers.setFieldsVisibility(form, fieldsList, val)){
			form = form;
		}
	}

	export function setVisibleFields(fieldsList) {
	  setFieldsVisibility(fieldsList, true);
	}

	export function setInvisibleFields(fieldsList) {
	  setFieldsVisibility(fieldsList, false);
	}

	export function setFieldValue(fieldName, value) {
		if (FormHelpers.setFieldValue(form, fieldName, value)){
	    onFieldChange({
	      detail: {
	        field: fieldName,
	        value
	      }
	    });
		}
	}

	export function updateField(fieldName, props){
		form[fieldName] = {
			...form[fieldName],
			...props
		};
		form = form;
	}

	function onFieldChange(ev) {
		let data = ev.detail;
		form[data.field].value = data.value;
		form = form;
		dispatch('change', data);
	}

	function submitForm(e){
		e && e.preventDefault();
		dispatch('submit', collectData());
		return false;
	};

	function rejectForm(){
		dispatch('reject');
	}
</script>

<div class="form-container">

{#if loader!=='hidden' }
<div class="{loader==='page'?'pageloader':'containerloader'} {loading?'is-active':''}" ><span class="title">{$LOCALE[WAITING_TEXT]}</span></div>
{/if}

{#if success}
<div class="notification is-success">
	<h3 class="form-success-message">{$LOCALE[SUCCESS_TEXT]}</h3>
</div>
{:else}
{#if title }
<h5 class="title is-5">{$LOCALE[title]}</h5>
{/if}
{#if description }
<h6 class="subtitle is-6">{$LOCALE[description]}</h6>
{/if}

{#if buttonsFirst }
<div class="buttons is-grouped is-centered">
	{#if cancel.enabled}
	<button class="button is-outlined {cancel.classes}" on:click={rejectForm}>{$LOCALE[cancel.caption]}</button>
	{/if}
	{#if submit.enabled}
	<button on:click={submitForm} disabled={formInvalid} class="button is-primary is-hovered {submit.classes}">{$LOCALE[submit.caption]}</button>
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
		<UIField controls={[form[subfield]]} on:change={onFieldChange} name={subfield} horizontal={horizontal} label={form[subfield].label} />
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
<UIField controls={[form[field]]} on:change={onFieldChange} name={field} horizontal={horizontal} label={form[field].label} />
{/if}
{:else}
<div class="notification is-danger">Field '{field}' is not registered</div>
{/if}
{/if}
{/each}

{#if !buttonsFirst }
{#if formErrors.length > 0 }
<div class="edit-form-error notification is-danger">{formErrors.join(', ')}</div>
{/if}
<div class="buttons is-grouped is-centered">
	{#if cancel.enabled}
	<button class="button is-outlined {cancel.classes}" on:click={rejectForm}>{$LOCALE[cancel.caption]}</button>
	{/if}
	{#if submit.enabled}
	<button on:click={submitForm} disabled={formInvalid} class="button is-primary is-hovered {submit.classes}">{$LOCALE[submit.caption]}</button>
	{/if}
</div>
{/if}
{/if}
</div>
