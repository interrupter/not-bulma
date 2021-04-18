<script>

  const COMPONENT_NAME = 'top-navbar-burger';

  import { createEventDispatcher, onMount } from 'svelte';
const dispatch = createEventDispatcher();

  import {notCommon} from '../frame';

  export let events = {};
  export let register = notCommon.registerWidgetEvents.bind(notCommon);

  export let closed = true;

  function toggle(e){
    e.preventDefault();
    closed = !closed;
    dispatch('toggle', {closed} );
    return false;
  }

  function getStandartUpdateEventName(){
    return COMPONENT_NAME + ':update';
  }

  export let onUpdate = (data)=>{
    closed = data.closed;
  };

  onMount(() => {
    if (!Object.prototype.hasOwnProperty.call(events, getStandartUpdateEventName())){
      events[getStandartUpdateEventName()] = onUpdate;
    }
    register(events);
  });

</script>

<a href on:click={toggle} role="button" class="navbar-burger {closed?'':'is-active'}" aria-label="menu" aria-expanded="false" data-target="navbar">
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
  <span aria-hidden="true"></span>
</a>
