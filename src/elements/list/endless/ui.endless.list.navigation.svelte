<script>
    import {LOCALE} from '../../../locale';
    import UIButton from '../../button/ui.button.svelte';
    
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();

   // export let skip = 0;
    

   /**
    * @typedef {Object} Props
    * @property {number} [page] - export let count = 0;
    * @property {number} [pages]
    * @property {any} [buttonComponent]
    * @property {any} [buttonComponentProps]
    */

   /** @type {Props} */
   let {
       page = 0,
       pages = 0,
       buttonComponent = UIButton,
       buttonComponentProps = {}
   } = $props();

</script>

{#if pages > 0 }
<div class="columns">
    <div class="column">
        {#if page > 1 }
        {@const SvelteComponent = buttonComponent}
        <SvelteComponent            
            {...buttonComponentProps}
            action={() => dispatch('prev')}
            >{$LOCALE['not-node:list_navigation_prev_button_label']}</SvelteComponent>
        {/if}
    </div>
    {#if pages > 1 }
    <div class="column box">
        {page} / {pages}
    </div>
    {/if}
    <div class="column">
        {#if page < pages }
        {@const SvelteComponent_1 = buttonComponent}
        <SvelteComponent_1            
            {...buttonComponentProps}
            action={() => dispatch('next')}
            >{$LOCALE['not-node:list_navigation_next_button_label']}</SvelteComponent_1>
        {/if}
    </div>
</div>
{/if}

