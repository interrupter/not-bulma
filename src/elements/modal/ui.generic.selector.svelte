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
      
  
  /**
   * @typedef {Object} Props
   * @property {boolean} [show]
   * @property {string} [term]
   * @property {string} [size]
   * @property {any} [inputComponent]
   * @property {any} [inputComponentProps]
   * @property {any} [outputComponent]
   * @property {any} [outputComponentProps]
   * @property {any} [results]
   */

  /** @type {Props} */
  let {
      show = true,
      term = $bindable(''),
      size = 'narrow',
      inputComponent = UISimpleSearchInput,
      inputComponentProps = {},
      outputComponent = UIEndlessList,
      outputComponentProps = {},
      results = $bindable({list:[], page:0, pages:0,skip:0,count:0})
  } = $props();
  
     
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
    {@const SvelteComponent = inputComponent}
    {@const SvelteComponent_1 = outputComponent}
    <div class="paper box block {size}">
      <SvelteComponent on:termChange bind:term={term} {...inputComponentProps}></SvelteComponent>
      <SvelteComponent_1 
        bind:data={results} 
          on:prev
          on:next
          on:select={select}
          {...outputComponentProps}
        ></SvelteComponent_1>
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
  