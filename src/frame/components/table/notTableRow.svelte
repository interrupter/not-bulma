<script>
  import UITableCell from './notTableCell.svelte';
  import * as Stores from './stores.js';
  
  import {onMount, createEventDispatcher} from 'svelte';
  let dispatch = createEventDispatcher();

  let itemId = $state(), selectedList;

  onMount(() => {
      itemId = getItemId(item);
      selectedList = Stores.get(id).selected;
  });


  /**
   * @typedef {Object} Props
   * @property {any} id
   * @property {any} [item]
   * @property {any} [helpers]
   * @property {any} [fields]
   * @property {boolean} [showSelect]
   * @property {any} [getItemId]
   */

  /** @type {Props} */
  let {
      id,
      item = {},
      helpers = {},
      fields = [],
      showSelect = false,
      getItemId = ()=>{}
  } = $props();

  function onRowSelect(e){
      e.preventDefault();
      dispatch('rowSelectChange', {
          id:       itemId,
          selected: $selectedList[itemId]
      });
      return false;
  }


</script>

<tr>
  {#if showSelect && $selectedList }
  <td>
    <input id="table-row-select-{getItemId(item)}" type="checkbox" data-id="{getItemId(item)}" bind:checked={$selectedList[itemId]} placeholder="" name="row_selected_{getItemId(item)}" onchange={onRowSelect} />
  </td>
  {/if}
  {#each fields as field }
  <UITableCell {field} {helpers} {item} {getItemId} />
  {/each}
</tr>
