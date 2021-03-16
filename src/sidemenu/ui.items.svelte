<script>
	import UISideMenuItemWithChildren from './ui.item.with.children.svelte';
	import UISideMenuItemWithoutChildren from './ui.item.without.children.svelte';

	export let root = '';
	export let items = [];
	export let closed = false;

</script>


<ul class="menu-list {closed?'is-closed':''}">
{#each items as item}
	{#if item.items && item.items.length }
		<UISideMenuItemWithChildren {root} {item} on:navigate />
	{:else}
		<UISideMenuItemWithoutChildren {root} {item} on:navigate />
	{/if}
{/each}
</ul>
