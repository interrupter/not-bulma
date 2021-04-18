<script>
  import 'bulma-switch';

  import { createEventDispatcher } from 'svelte';
  let dispatch = createEventDispatcher();

  export let id = '';
  export let value = false;
  export let fieldname = 'switch';
  export let disabled = false;
  export let readonly = false;
  export let styling = " is-rounded is-success ";

function onInput(ev){
    let data = {
      id,
      field: fieldname,
      value: ev.target.type === 'checkbox' ? ev.target.checked:ev.target.value
    };
    dispatch('change', data);
    return true;
}

</script>

<input type="checkbox"
  class="switch {styling}"
  id="edit-table-row-cell-inline-switch-{fieldname}-{id}"
  bind:checked={value}
  name="{fieldname}"
  {readonly} {disabled}
  on:input={onInput}
  />
<label class="label" for="edit-table-row-cell-inline-switch-{fieldname}-{id}"></label>
