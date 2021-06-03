<script>
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	import UISideMenuItemWithoutChildren from './ui.item.without.children.svelte';

	import UISideMenuTrigger from './ui.trigger.svelte';
	import UISideMenuItemLabel from './ui.item.label.svelte';

	export let root = '';
	export let items = [];
	export let closed = false;

	function toggle({detail}) {
  closed = detail.closed;
}

function onClick(ev){
  ev.preventDefault();
  dispatch('navigate', {
    full: ev.target.getAttribute('href'),
    short: ev.target.dataset.href
  });
  return false;
	}

</script>


<ul class="menu-list {closed?'is-closed':''}">
{#each items as item}
	{#if item.items && item.items.length }
	<li class="{(typeof item.url === 'undefined' || item.url===false)?'':'is-no-follow-subtitle'} {item.classes}">
		{#if (typeof item.url !== 'undefined' && item.url!==false) }
		<a href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">
			<UISideMenuItemLabel {item} />
			<UISideMenuTrigger {closed} on:toggle={toggle} />
		</a>
		{:else}
			<UISideMenuItemLabel {item} />
			<UISideMenuTrigger {closed} on:toggle={toggle} />
		{/if}
		<svelte:self {root} items="{item.items}" {closed} on:navigate />
	</li>
	{:else}
	<UISideMenuItemWithoutChildren {root} {item} on:navigate />
	{/if}
{/each}
</ul>
