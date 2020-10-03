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
		<a href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">
			{item.title}
			{#if item.tag }
			<span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
			{/if}
			{#if item.indicator }
				<UIIndicator {...(item.indicator)} />
			{/if}
		</a>
		{:else}
		<a href>
			{item.title}
			{#if item.tag }
			<span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
			{/if}
			{#if item.indicator }
				<UIIndicator {...(item.indicator)} />
			{/if}
		</a>
		{/if}
		<svelte:self items="{item.items}" {root} on:navigate />
	</li>
	{:else}
	{#if item.url }
	<li><a href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">
		{item.title}
		{#if item.tag }
		<span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
		{/if}
		{#if item.indicator }
			<UIIndicator {...(item.indicator)} />
		{/if}
	</a></li>
	{:else }
	<li><a href>
		{item.title}
		{#if item.tag }
		<span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
		{/if}
		{#if item.indicator }
			<UIIndicator {...(item.indicator)} />
		{/if}
	</a></li>
	{/if}
	{/if}
{/each}
</ul>
