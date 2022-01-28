<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();

  import {LOCALE} from '../../../../locale';
  import UIIndicator from '../../../../elements/various/ui.indicator.svelte';

  export let root = '';
  export let item = {};

  function onClick(ev){
    ev.preventDefault();
    dispatch('navigate', {
      full: ev.target.getAttribute('href'),
      short: ev.target.dataset.href
    });
    return false;
}

</script>

{#if (typeof item.url !== 'undefined' && item.url!==false) }
<li class="{item.classes}">
  <a href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">
  {$LOCALE[item.title]}
  {#if item.tag }
    <UIIndicator id={item.id} {...item.tag} />
  {/if}
  {#if item.indicator }
    <UIIndicator id={item.id} {...item.indicator } />
  {/if}
</a></li>
{:else }
<li class="is-no-follow-subtitle {item.classes}">
  {$LOCALE[item.title]}
  {#if item.tag }
    <UIIndicator id={item.id} {...item.tag} />
  {/if}
  {#if item.indicator }
    <UIIndicator id={item.id} {...item.indicator } />
  {/if}
</li>
{/if}
