<script>
	import * as Stores from './../stores.js';
	import TableImages from '../ui.images.svelte';
	import TableLinks from '../ui.links.svelte';
	import TableButtons from '../ui.buttons.svelte';
	import TableBooleans from '../ui.booleans.svelte';
	import TableSwitch from './controls/ui.switch.svelte';
	import TableTags from './controls/ui.tags.svelte';

	import notPath from 'not-path';
	import { onMount } from 'svelte';
	import {createEventDispatcher} from 'svelte';
	let dispatch = createEventDispatcher();

	export let id;

	export let helpers = {};
	export let state = {};
	export let fields = [];
	export let selected = {};
	export let items = [];
	export let actions = [];
	export let links = [];
	export let search = '';
	export let showSearch = true;
	export let showSelect = true;
	export let selectAll = false;

	export function getItemId(item){
		return item._id;
	}

	onMount(() => {

		if(showSelect){
			Stores.get(id).selected.subscribe(value => {
				selected = value;
			});
		}

		Stores.get(id).refined.subscribe(value => {
			items = value;
			if(showSelect){
				for(let itemId in selected){
					if(! items.some(item => getItemId(item) === itemId)){
						delete selected[itemId];
					}else{
						if(!Object.prototype.hasOwnProperty.call(selected, itemId)){
							selected[itemId] = false;
						}
					}
				}
				selected=selected;
			}
		});

		Stores.get(id).state.subscribe(value => {
			state = value;
		});

	});

	function getActivePageIndex(){
		return items.findIndex(item => item.active );
	}

	function onSearchInput(ev){
		try{
			let data = ev.currentTarget.value.trim();
			dispatch('searchChange', data);
		}catch(e){
			return;
		}
	}

	function goPrev(){
		dispatch('goToPrevPage');
	}

	function goNext(){
		dispatch('goToNextPage');
	}

	function goTo(e){
		e.preventDefault();
		let el = e.target;
		dispatch('goToPage', parseInt(el.dataset.page));
		return false;
	}

	function onRowSelect(e){
		e.preventDefault();
		let itemId = e.currentTarget.dataset.id;
		Stores.get(id).selected.update((value)=>{return value;});
		dispatch('rowSelectChange', {
			id: 			itemId,
			selected: selected[itemId]
		});
		return false;
	}

	function onSelectAll(e){
		Stores.get(id).selected.update((value)=>{
			items.forEach(item => {
				value[getItemId(item)] = selectAll;
			});
			return value;
		});
	}

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
{#if showSearch }
<div class="field">
	<div class="control">
		<input class="input" type="text" placeholder="Поиск" bind:value="{search}" on:input={onSearchInput}>
	</div>
</div>
{/if}
<table class="table">
	<thead>
		{#if showSelect }
		<th><input type="checkbox" id="table-row-select-page" bind:checked={selectAll} placeholder="" name="row_selected_all" on:change={onSelectAll} /></th>
		{/if}
		{#each fields as field}
		<th>{field.title}</th>
		{/each}
	</thead>
	<tbody>
		{#each items as item (item._id)}
		<tr>
			{#if showSelect }
			<td>
				<input type="checkbox" id="table-row-select-{getItemId(item)}" data-id="{getItemId(item)}" bind:checked={selected[getItemId(item)]} placeholder="" name="row_selected_{getItemId(item)}"  on:change={onRowSelect} />
			</td>
			{/if}
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
				{:else if field.type === 'tag' }
				<TableTags values={ notPath.get(field.path, item, helpers) } />
				{:else if field.type === 'switch' }
				<TableSwitch
					id={getItemId(item)}
					fieldname={field.path}
					on:change="{field.onChange}"
					value={ notPath.get(field.path, item, helpers) }
					disabled={field.disabled}
					readonly={field.readonly}
					/>
				{:else}
				{notPath.get(field.path, item, helpers)}
				{/if}
			</td>
			{/each}
		</tr>
		{/each}
	</tbody>
</table>
<nav class="pagination is-centered" role="navigation" aria-label="pagination">
	<a class="pagination-previous" on:click={goPrev}>Назад</a>
	<a class="pagination-next" on:click={goNext}>Вперед</a>
	<ul class="pagination-list">
		{#if state.pagination && state.pagination.pages && state.pagination.pages.list }
		{#each state.pagination.pages.list as page}
		<li>
			{#if page.active}
			<a class="pagination-link is-current" aria-label="Страница {page.index}" aria-current="page">{page.index+1}</a>
			{:else}
			<a class="pagination-link" aria-label="Страница {page.index}" data-page="{page.index}" on:click={goTo}>{page.index+1}</a>
			{/if}
		</li>
		{/each}
		{/if}
	</ul>
</nav>
