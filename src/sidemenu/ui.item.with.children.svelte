<script>
  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  import UISideMenuTrigger from './ui.trigger.svelte';
  import UISideMenuItems from './ui.items.svelte';
  import UISideMenuItemLabel from './ui.item.label.svelte';

  export let root = '';
  export let item = {};
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
  <UISideMenuItems {root} items="{item.items}" {closed} on:navigate />
</li>
