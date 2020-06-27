<script>
  import * as TableStores from './notTable.stores.js';
  import TableImages from '../ui.images.svelte';
  import TableLinks from '../ui.links.svelte';
  import TableButtons from '../ui.buttons.svelte';
  import TableBooleans from '../ui.booleans.svelte';

  import notPath from 'not-path';
  import { onMount } from 'svelte';

  export let id;

  export let helpers = {};
  export let state = {};
  export let fields = [];
  export let items = [];
  export let actions = [];
  export let links = [];

  onMount(() => {
		TableStores.get(id).refined.subscribe(value => {
			items = value;
		});

    TableStores.get(id).state.subscribe(value => {
			state = value;
		});
	});

</script>

{#if links.length}
<div class="field is-grouped">
  <TableLinks values={links} />
</div>
{/if}
{#if actions.length}
<div class="field is-grouped">
  <TableButtons values={actions} />
</div>
{/if}
<table class="table">
  <thead>
    {#each fields as field}
    <th>{field.title}</th>
    {/each}
  </thead>
<tbody>
  {#each items as item (item._id)}
    <tr>
    {#each fields as field}
      <td>
        {#if field.type === 'link' }
        <TableLinks values={ notPath.get(field.path, item, helpers) } />
        {:else if field.type === 'button' }
        <TableButtons values={ notPath.get(field.path, item, helpers) } />
        {:else if field.type === 'image' }
        <TableImages values={ notPath.get(field.path, item, helpers) } />
        {:else if field.type === 'boolean' }
        <TableBooleans values={ notPath.get(field.path, item, helpers) } />
        {:else}
        {notPath.get(field.path, item, helpers)}
        {/if}
      </td>
    {/each}
    </tr>
  {/each}
</tbody>
<tfoot>
  <nav class="pagination is-centered" role="navigation" aria-label="pagination">
  <a class="pagination-previous">Назад</a>
  <a class="pagination-next">Вперед</a>
  <ul class="pagination-list">
    {#if state.pagination && state.pagination.pages && state.pagination.pages.list }
    {#each state.pagination.pages.list as page}
    <li>
      {#if page.active}
      <a class="pagination-link is-current" aria-label="Страница {page.index}" aria-current="page">{page.index+1}</a>
      {:else}
      <a class="pagination-link" aria-label="Страница {page.index}">{page.index+1}</a>
      {/if}
    </li>
    {/each}
    {/if}
  </ul>
</nav>
</tfoot>
</table>
