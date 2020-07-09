<script>
	import UITextfield from './ui.textfield.svelte';

	import {
		FIELDS,
		COMPONENTS
	} from './LIB.js';
	import {
		onMount
	} from 'svelte';
	import {
		createEventDispatcher
	} from 'svelte';
	let dispatch = createEventDispatcher();

	let form = {};
	let validate = () => {
		return { clean: true };
	}
	let overlay;
	let stage = 'filling';
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
			value: '',
			required: true,
			validated: false,
			valid: false,
			errors: false
		};
		if (FIELDS.contain(type)) {
			Object.assign(field, FIELDS.get(type));
		}
		if (mutation) {
			Object.assign(field, mutation);
		}
		return field;
	}

	function collectData() {
		let result = {};
		fields.forEach((fieldname) => {
			if (Object.prototype.hasOwnProperty.call(form, fieldname) && form[fieldname].enabled) {
				result[fieldname] = form[fieldname].value;
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
					form[fname].errors = false
				}
				if (form[fname].errors !== false) {
					console.log(fname, form[fname].errors);
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
		form[fieldName].formLevelError = true;
		form = form;
	}

	export function setFormFieldValid(fieldName, value) {
		form[fieldName].formErrors = false;
		form[fieldName].validated = true;
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

	onMount(() => {
		fields.forEach((fieldName) => {
			let opts = {};
			if (Object.prototype.hasOwnProperty.call(options, 'fields')) {
				if (Object.prototype.hasOwnProperty.call(options.fields, fieldName)) {
					opts = options.fields[fieldName];
				}
			}
			form[fieldName] = fieldInit(fieldName, opts);
		});
		if (Object.prototype.hasOwnProperty.call(options, 'validate') && typeof options.validate === 'function') {
			validate = options.validate;
		}
		form = form;
	});

	function onFieldChange(ev) {
		let data = ev.detail;
		if (validation) {
			//fields level validations
			let res = typeof form[data.field].validate === 'function' ? form[data.field].validate(data.value): [];
			if (res.length === 0) {
				setFieldValid(data.field, data.value);
			} else {
				setFieldInvalid(data.field, data.value, res);
			}
			//form level validations
			let errors = validate(collectData());
			if ((!errors) || errors.clean) {
				formErrors.splice(0, formErrors.length);
				formErrors = formErrors;
				formHasErrors = false;
			} else {
				if ((errors.form.length === 0) && Object.keys(errors.fields).length === 0) {
					formHasErrors = false;
					for (let fieldName in fields) {
						setFormFieldValid(fieldName);
					}
				} else {
					if (errors.form.length) {
						errors.form.forEach((err) => {
							if (!formErrors.includes(err)) {
								formErrors.push(err);
							}
						});
						formErrors = formErrors;
					} else {
						formErrors.splice(0, formErrors.length);
						formErrors = formErrors
					}
					for (let fieldName of fields) {
						if (Object.prototype.hasOwnProperty.call(errors.fields, fieldName)) {
							setFormFieldInvalid(fieldName, errors.fields[fieldName]);
						} else {
							setFormFieldValid(fieldName);
						}
					}
					formHasErrors = true;
				}
			}
		} else {
			dispatch('change', data);
		}
	}

	export let fields = [];
	export let options = {};
	export let validation = true;
	export let CLASS_OK = 'is-success';
	export let CLASS_ERR = 'is-danger';
	export let SUCCESS_TEXT = 'Операция завершена';

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

	export let mode = 'create';
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
	}

	export function setLoading() {
		loading = true;
	}

	export function resetLoading() {
		loading = false;
	}
</script>

<div class="container">
	{#if success}
	<div class="notification is-success">
		<h3 class="form-success-message">{SUCCESS_TEXT}</h3>
	</div>
	{:else}
	{#if title }
	<h5 class="title">{title}</h5>
	{/if}
	{#if description }
	<h6 class="subtitle is-6">{description}</h6>
	{/if}

	{#each fields as field}
	{#if form[field] && form[field].component }
	<svelte:component this={COMPONENTS.get(form[field].component)} {...form[field]} on:change={onFieldChange} fieldname={field} />
	{:else}
	<div class="is-danger">Field '{field}' is not registered</div>
	{/if}
	{/each}

	{#if formErrors.length > 0 }
	<div class="edit-form-error notification is-danger">{formErrors.join(', ')}</div>
	{/if}

	<div class="buttons-row">
		{#if cancel.enabled}
		<button class="button is-outlined" on:click={rejectForm}>{cancel.caption}</button>
		{/if}
		{#if submit.enabled}
		<button on:click={submitForm} disabled={formInvalid} class="button is-primary is-hovered pull-right">{submit.caption}</button>
		{/if}
	</div>
	{/if}
</div>
