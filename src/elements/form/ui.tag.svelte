<script>
  import {LOCALE} from '../../locale';
  import { createEventDispatcher } from 'svelte';
  let dispatch = createEventDispatcher();
  /*
  item = {
    id,        //unique
    title,     //some text
    type       //for coloring items, usual html template names danger, success, etc
  }
  */

  export let items = [];
  export let variants = [];
  export let error = false;
  export let readonly = false;
  export let beforeAdd = (/*item, list*/)=>{
    return true;
  };

  function remove(e){
    e && e.preventDefault();
    let id = parseInt(e.currentTarget.dataset.id);
    let item = items.find(el => el.id === id);
    if(item){
      items.splice(items.indexOf(item), 1);
      items = items;
      dispatch('change', items);
    }
    return false;
  }

  function add(e){
    e && e.preventDefault();
    let id = parseInt(e.currentTarget.parentNode.querySelector('select').value);
    let item = variants.find(el => el.id === id);
    if(!beforeAdd(item, items)){
      return false;
    }
    if(item && (items.indexOf(item) === -1)){
      items.push(item);
      items = items;
      dispatch('change', items);
    }
    return false;
  }

  $: classes = error?'is-danger':'';

</script>

<div class="columns">
  <div class="column {classes}">
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
          <option value="-1" selected>{$LOCALE['Выберите из списка...']}</option>
          {#each variants as variant}
          <option value="{variant.id}">{$LOCALE[variant.title]}</option>
          {/each}
        </select>
      </div>
      <button class="button is-primary is-small" on:click={add}>{$LOCALE['Добавить']}</button>
    </div>
  </div>
  {/if}
</div>
