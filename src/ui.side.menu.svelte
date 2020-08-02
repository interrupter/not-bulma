<script>
	import UISideMenuSection from './ui.side.menu.section.svelte';
	export let title = 'Side menu';
	export let root = '';
	export let items = [];
	export let sections = [];
	export let navigate = null;

	function onClick(ev) {
		if (typeof navigate === 'function') {
			navigate(ev.detail);
		}
	}

</script>


<aside class="menu">
	{#each sections as section}
	<UISideMenuSection {section} {items} {root} on:navigate={onClick} />
	{/each}
</aside>
