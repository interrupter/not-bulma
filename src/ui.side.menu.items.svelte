<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	
	export let root = '';
	export let items = [];

	function onClick(ev){
		ev.preventDefault();
		dispatch('navigate', {
			full: ev.target.getAttribute('href'),
			short: ev.target.dataset.href
		});
		return false;
	}

</script>
<ul class="menu-list">
{#each items as item}
	{#if item.items && item.items.length }
	<li>
		{#if item.url }
		<a href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">{item.title}</a>
		{:else}
		<a>{item.title}</a>
		{/if}
		<svelte:self items="{item.items}" {root} on:navigate />
	</li>
	{:else}
	{#if item.url }
	<li><a href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">{item.title}</a></li>
	{:else }
	<li><a>{item.title}</a></li>
	{/if}
	{/if}
{/each}
</ul>
