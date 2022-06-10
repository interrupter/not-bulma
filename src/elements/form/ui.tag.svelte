<script>
  import {LOCALE} from '../../locale';
  import ErrorsList from '../various/ui.errors.list.svelte';
  import UICommon from '../common.js';
  import {createEventDispatcher } from 'svelte';
  let dispatch = createEventDispatcher();
  const LC_ADD = 'not-node:add_label';
  const LC_SELECT_FROM_LIST = 'not-node:select_from_list_label';
  //list of item ids
  export let value = []; //raw ids of variants
  export let inputStarted = false;
  export let variants = [];
  export let fieldname = 'tag';
  export let required = true;
  export let readonly = false;
  export let valid = true;
  export let validated = false;
  export let errors = false;
  export let formErrors = false;
  export let formLevelError = false;

  export let beforeAdd = (/*variant, variants*/)=>{
    return true;
  };

  export let getItemId = (variant)=>{
    return variant.id;
  };

  export let getItemTitle = (variant)=>{
    return variant.title;
  };

  export let getItemType = (variant)=>{
    return 'info';
  };

  export let buildItem = (variant)=>{
    return {
      id: getItemId(variant),
      title: getItemTitle(variant),
      type: getItemType(variant)
    };
  };

  function variantIdToVariant(id){
    return variants.find(variant => getItemId(variant) === id);
  }

  function changeEvent(){
    let data = {
      field: fieldname,
      value
    };
    dispatch('change', data);
  }

  function remove(e){
    e && e.preventDefault();
    let id = e.currentTarget.dataset.id;
    if(value.includes(id)){
      value.splice(value.indexOf(id), 1);
      value = value;
      changeEvent();
    }
    return false;
  }

  function add(e){
    e && e.preventDefault();
    let id = e.currentTarget.parentNode.querySelector('select').value;
    const variant = variantIdToVariant(id);
    if(!variant){
      return false;
    }
    if(!beforeAdd(variant, variants)){
      return false;
    }
    if(id && (value.indexOf(id) === -1)){
      value.push(id);
      value = value;
      changeEvent();
    }
    return false;
  }
  /*
  item = {
    id,        //unique
    title,     //some text
    type       //for coloring items, usual html template names danger, success, etc
  }
  */
  $: items = value.map(variantIdToVariant).map(buildItem);
  $: allErrors = [].concat(errors?errors:[], formErrors?formErrors:[]);
  $: showErrors = (!(validated && valid) && (inputStarted));
  $: invalid = ((valid===false) || (formLevelError));
  $: validationClasses = (valid===true || !inputStarted)?UICommon.CLASS_OK:UICommon.CLASS_ERR;

</script>

<div class="control columns">
  <div class="column {validationClasses}">
    {#each items as item (item.id)}
    <span class="mx-1 tag is-{item.type}">{$LOCALE[item.title]}
      {#if !readonly }
      <button data-id="{item.id}" class="delete is-small" on:click="{remove}"></button>
      {/if}
    </span>
    {/each}
  </div>
  {#if !readonly }
  <div class="column">
    <div class="control">
      <div class="select is-small">
        <select>
          <option value="-1" selected>{$LOCALE[LC_SELECT_FROM_LIST]}</option>
          {#each variants as variant}
          <option value="{variant.id}">{$LOCALE[variant.title]}</option>
          {/each}
        </select>
      </div>
      <button class="button is-primary is-small" on:click={add}>{$LOCALE[LC_ADD]}</button>
    </div>
  </div>
  {/if}
</div>
<ErrorsList
  bind:errors={allErrors}
  bind:show={showErrors}
  bind:classes={validationClasses}
  id="input-field-helper-{fieldname}"
  />
