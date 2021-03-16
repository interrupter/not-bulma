<script>

  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  const CLASS_ICON = {
    OPENED: 'fa-angle-down',
    CLOSED: 'fa-angle-up',
  };

  export let icon_opened = CLASS_ICON.OPENED;
  export let icon_closed = CLASS_ICON.CLOSED;

  export let closed = false;

  function onClick(e){
    e && e.preventDefault();
    closed = !closed;
    dispatch('toggle', {closed})
    return false;
  }

</script>

<span class="icon is-small is-toggle-submenu is-pulled-right" on:click={onClick}>
  <i class="fas {closed?icon_closed:icon_opened}" aria-hidden="true"></i>
</span>
