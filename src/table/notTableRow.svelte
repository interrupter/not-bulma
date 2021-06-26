<script>
  import UITableCell from './notTableCell.svelte';
  import * as Stores from './../stores.js';
  import { onMount } from 'svelte';

  import {createEventDispatcher} from 'svelte';
  let dispatch = createEventDispatcher();

  let itemId, selectedList;

  onMount(() => {
    itemId = getItemId(item);
    selectedList = Stores.get(id).selected;
  });

  export let id;

  export let item = {};
  export let helpers = {};
  export let fields = [];
  export let showSelect = false;
  export let getItemId = ()=>{};

  function onRowSelect(e){
	  e.preventDefault();
	  dispatch('rowSelectChange', {
	    id: 			itemId,
	    selected: $selectedList[itemId]
	  });
	  return false;
	}


</script>

<tr>
  {#if showSelect && $selectedList }
  <td>
    <input
      id="table-row-select-{getItemId(item)}"
      type="checkbox"
      data-id="{getItemId(item)}"
      bind:checked={$selectedList[itemId]}
      placeholder=""
      name="row_selected_{getItemId(item)}"
      on:change={onRowSelect}
      />
  </td>
  {/if}
  {#each fields as field }
  <UITableCell {field} {helpers} {item} {getItemId} />
  {/each}
</tr>
