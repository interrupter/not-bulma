<script>
  import {onMount} from 'svelte';

  import SideMenu from '../index.js';
  import UIIcon from '../../../../elements/icon/ui.icon.svelte';

  export let iconOpen = {
    src: '/img/icon/sidemenu/side_menu-i-32.png',
    width: 32,
    height: 32
  };

  export let iconClose = {
    src: '/img/icon/sidemenu/side_menu-is-32.png',
    width: 32,
    height: 32
  };

  let open = true;

  function toggle(e){
    e && e.preventDefault();
    SideMenu.toggle();
    updateState();
    return false;
  }

  function updateState(){
    open = SideMenu.isOpen();
  }

  onMount(()=>{
    updateState();
  });

</script>


<a href on:click={toggle} class="is-sidemenu-burger {open?'is-active':''}">
  {#if open }
  <UIIcon {...iconClose} />
  {:else}
  <UIIcon {...iconOpen} />
  {/if}
</a>
