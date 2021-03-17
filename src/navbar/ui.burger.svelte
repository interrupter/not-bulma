<script>
  import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

  export let closed = true;

  function toggle(e){
    e.preventDefault();
    closed = !closed;
    dispatch('toggle', {closed} );
    return false;
  }

</script>

<a href on:click={toggle} role="button" class="navbar-burger {closed?'':'is-active'}" aria-label="menu" aria-expanded="false" data-target="navbar">
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
</a>
