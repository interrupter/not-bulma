<script>
    import {LOCALE} from '../../locale';
    import UIButtons from '../button/ui.buttons.svelte';
    import UIOverlay from './ui.overlay.svelte';
  
    import {UIEndlessList} from '../list/endless';
    import UISimpleSearchInput from '../various/ui.simple.search.input.svelte';
       
    import {
      onMount,
      createEventDispatcher
    } from 'svelte';
  
    let dispatch = createEventDispatcher();
      
    export let show = true;
    export let term = '';
    export let size = 'narrow';
  
    export let inputComponent = UISimpleSearchInput;
    export let inputComponentProps = {};
    export let outputComponent = UIEndlessList;
    export let outputComponentProps = {};
    export let results = {list:[], page:0, pages:0,skip:0,count:0};
  
     
    onMount(() => {
      
    });
  
    const buttons = [
      {
        title: $LOCALE['not-node:button_cancel_label'],
        action: () => reject(),
      }
    ];
  
    function overlayClosed() {
      dispatch('reject');
    }
  
    function select({
      detail
    }) {
      console.log('selected user', detail);
      dispatch('resolve', detail);
    }
  
    function reject(){
      dispatch('reject');
    }
  
   
  </script>
  
  
  <UIOverlay on:reject="{overlayClosed}" {show} closeOnClick={true} closeButton={false}>
    <div class="paper box block {size}">
      <svelte:component this={inputComponent} on:termChange bind:term={term} {...inputComponentProps}></svelte:component>
      <svelte:component 
        this={outputComponent} 
        bind:data={results} 
          on:prev
          on:next
          on:select={select}
          {...outputComponentProps}
        ></svelte:component>
        <UIButtons values={buttons} centered={true} classes="mt-5"/>
    </div>
  </UIOverlay>
  
  <style>
    .paper.box {
      margin: 10vh auto auto auto;
    }
  
    .paper.box.fullscreen{
      width: 100vw;
    }
  
    .paper.box.wide{
      width: 75vw;
    }
  
    .paper.box.normal{
      width: 50vw;
    }
  
    .paper.box.narrow{
      width: 25vw;
    }  
  
    @media (max-width: 700px) {
      .paper.box {
        width: 100vw;
        height: 100vh;
        margin: 0vh auto auto auto;
      }
    }
  </style>
  