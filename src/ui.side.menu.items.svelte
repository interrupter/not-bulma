<script>
	import UIIndicator from './ui.indicator.svelte';
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

	function getActiveClass(link){
		if(window.location.href.indexOf(link) > - 1){
			return ' is-active ';
		}else{
			return '';
		}
	}

</script>
<ul class="menu-list">
{#each items as item}
	{#if item.items && item.items.length }
	<li class="{item.url?'':'is-no-follow-subtitle'}">
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
			{item.title}
			{#if item.tag }
			<span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
			{/if}
			{#if item.indicator }
				<UIIndicator {...(item.indicator)} />
			{/if}
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
	<li class="is-no-follow-subtitle">
		{item.title}
		{#if item.tag }
		<span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
		{/if}
		{#if item.indicator }
			<UIIndicator {...(item.indicator)} />
		{/if}
	</li>
	{/if}
	{/if}
{/each}
</ul>

<style>
.is-no-follow-subtitle{
	padding: .5em .75em;
}
</style>
