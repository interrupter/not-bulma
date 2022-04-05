import notCommon from '../../common';

const DEFAULT_FIELD = {
  label: '',
  placeholder: '',
  enabled: true,
  visible: true,
  required: true,
  validated: false,
  valid: false,
  errors: false
};

/**
* Creates field manifest
* @param {string} type      name/type of the field
* @param {Object} mutation  mutation to manifest from library
* @param {Object} VARIANTS  store which contains named lists of field value variants
* @param {Object} FIELDS    store which contains named lists of field manifests
* @return {Object}          field manifest
**/
function fieldInit(type, mutation = {}, VARIANTS, FIELDS) {
  let field = { ...DEFAULT_FIELD };
  //getting field core manifest
  if (FIELDS.contains(type)) {
    field = {
      ...field,
      ...FIELDS.get(type)
    };
  }
  //adding mutations
  if (mutation) {
    field = {
      ...field,
      ...mutation
    };
  }
  //adding variants list to field from VARIANTS store
  if (
    notCommon.objHas(field, 'variantsSource') &&
    VARIANTS.contains(field.variantsSource)
  ) {
    field.variants = VARIANTS.get(field.variantsSource);
  }else{
    if(!field.variants || field.variants.length === 0 ){
      field.variants = [];
    }
  }
  return field;
}

/**
* Initialization of form structure object
* @param {object}               form          form structure object
* @param {string|Array<string>} fieldName     name of the field type if string, array of strings = subform
* @param {Object}               VARIANTS      store which contains named lists of field value variants
* @param {Object}               FIELDS        store which contains named lists of field manifests
* @param {Object}               formFieldsOptions   form wide options
* @returns {Object}                           form structure object
**/
function initFormByField(form = {}, fieldName = [], VARIANTS, FIELDS, formFieldsOptions, data) {
  if (Array.isArray(fieldName)) {
    fieldName.forEach(subFormFieldName => initFormByField(form, subFormFieldName, VARIANTS, FIELDS, formFieldsOptions, data));
  } else {
    let opts = {};
    if (formFieldsOptions && notCommon.objHas(formFieldsOptions, 'mutations') && notCommon.objHas(formFieldsOptions.mutations, fieldName)) {
      opts = formFieldsOptions.mutations[fieldName]; //option mutation for field
    }
    if (data && notCommon.objHas(data, fieldName)) {
      opts.value = data[fieldName];
    }
    form[fieldName] = fieldInit(fieldName, opts, VARIANTS, FIELDS);
    //if form readonly, marking every field as readonly
    if (formFieldsOptions && formFieldsOptions.readonly) {
      form[fieldName].readonly = true;
    }
  }
  return form;
}

/**
*  Marking field as invalid by own validator
* @param {Object}           form          form structure object
* @param {string}           fieldName     name of the field
* @param {any}              value         value of field
* @param  {Array<string>}   errors        list of errors
* @return {Object}                        form structure object
**/
function setFieldInvalid(form, fieldName, value, errors) {
  form[fieldName].errors = [...errors];
  form[fieldName].validated = true;
  form[fieldName].valid = false;
  form[fieldName].value = value;
  return form;
}

/**
*  Marking field as valid by own validator
* @param {Object}           form          form structure object
* @param {string}           fieldName     name of the field
* @param {any}              value         value of field
* @return {Object}                        form structure object
**/
function setFieldValid(form, fieldName, value) {
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
  return form;
}

/**
* Checks if field has errors
* @param {Object}           form          form structure object
* @param {string}           fieldName     name of the field
* @returns {boolean}                      true - valid, false -invalid
**/
function isFieldValid(form, fieldName) {
  return !Array.isArray(form[fieldName].errors);
}

/**
* Form level validator error in this field
* @param {Object}           form          form structure object
* @param {string}           fieldName     name of the field
* @param  {Array<string>}   errors        list of errors
* @return {Object}                        form structure object
**/
function setFormFieldInvalid(form, fieldName, errors) {
  form[fieldName].formErrors = [...errors];
  form[fieldName].validated = true;
  form[fieldName].inputStarted = true;
  form[fieldName].valid = false;
  form[fieldName].formLevelError = true;
  return form;
}
/**
* Form level validator success in this field
* @param {Object}           form          form structure object
* @param {string}           fieldName     name of the field
* @return {Object}                        form structure object
**/
function setFormFieldValid(form, fieldName) {
  form[fieldName].formErrors = false;
  form[fieldName].validated = true;
  form[fieldName].valid = true;
  form[fieldName].formLevelError = false;
  return form;
}

/**
* Updates fields and form error labels
* @param {Object}           form                  form structure object
* @param {Object}           validationStatus      results of validation
**/
function updateFormValidationStatus(
  {
    form,
    formErrors,
    formHasErrors,
    fieldsHasErrors,
    validationStatus
  }  /* FormValidationSession.getCompleteResult() */
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
    for (let fieldName in validationStatus.fields) {
      if (Array.isArray(validationStatus.fields[fieldName]) && validationStatus.fields[fieldName].length) {
        setFormFieldInvalid(form, fieldName, validationStatus.fields[fieldName]);
        fieldsHasErrors = true;
      } else {
        setFormFieldValid(form, fieldName);
      }
    }
  }
}

function setFieldsVisibility(form, fieldsList, val) {
  if (Array.isArray(fieldsList)) {
    Object.keys(form).forEach(fieldName => {
      form[fieldName].visible = fieldsList.includes(fieldName) ? val : !val;
    });
    return true;
  }
  return false;
}

function setFieldValue(form, fieldName, value) {
  if (notCommon.objHas(form, fieldName)) {
    form[fieldName].value = value;
    return true;
  }
  return false;
}

function fieldIsVisibleAndFilled(form, fieldName){
  return notCommon.objHas(form, fieldName) &&
    form[fieldName].enabled &&
    form[fieldName].visible &&
    typeof form[fieldName].value !== 'undefined';
}

function collectData(fields, form) {
  let result = {};
  fields.flat().forEach((fieldName) => {
    if (fieldIsVisibleAndFilled(form, fieldName)) {
      result[fieldName] = form[fieldName].value;
    }
  });
  return result;
}

export default {
  fieldInit,
  initFormByField,
  setFieldInvalid,
  setFieldValid,
  isFieldValid,
  setFormFieldInvalid,
  setFormFieldValid,
  updateFormValidationStatus,
  fieldIsVisibleAndFilled,
  setFieldsVisibility,
  setFieldValue,
  collectData
};
