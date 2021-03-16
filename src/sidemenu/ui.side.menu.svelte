<script>
	import UISideMenuSection from './ui.section.svelte';
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

{#each sections as section}
<UISideMenuSection {section} {items} {root} on:navigate={onClick} />
{/each}
