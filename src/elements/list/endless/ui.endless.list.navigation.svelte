<script>
    import {LOCALE} from '../../../locale';
    import UIButton from '../../button/ui.button.svelte';
    
    import {createEventDispatcher} from 'svelte';
    const dispatch = createEventDispatcher();

   // export let skip = 0;
    //export let count = 0;
    export let page = 0;
    export let pages = 0;

    export let buttonComponent = UIButton;
    export let buttonComponentProps = {};

</script>

{#if pages > 0 }
<div class="columns">
    <div class="column">
        {#if page > 1 }
        <svelte:component
            this={buttonComponent}            
            {...buttonComponentProps}
            action={() => dispatch('prev')}
            >{$LOCALE['not-node:list_navigation_prev_button_label']}</svelte:component>
        {/if}
    </div>
    {#if pages > 1 }
    <div class="column box">
        {page} / {pages}
    </div>
    {/if}
    <div class="column">
        {#if page < pages }
        <svelte:component
            this={buttonComponent}            
            {...buttonComponentProps}
            action={() => dispatch('next')}
            >{$LOCALE['not-node:list_navigation_next_button_label']}</svelte:component>
        {/if}
    </div>
</div>
{/if}

