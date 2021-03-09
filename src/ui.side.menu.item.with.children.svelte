<script>
  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  import UISideMenuTrigger from './ui.side.menu.trigger.svelte';
  import UISideMenuItems from './ui.side.menu.items.svelte';
  import UISideMenuItemLabel from './ui.side.menu.item.label.svelte';

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

<li class="{item.url?'':'is-no-follow-subtitle'}">
  {#if item.url }
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
