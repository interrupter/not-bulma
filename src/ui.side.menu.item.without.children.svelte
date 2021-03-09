<script>
  import { createEventDispatcher } from 'svelte';
  const dispatch = createEventDispatcher();
  
  import UIIndicator from './ui.indicator.svelte';

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

{#if item.url }
<li><a href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">
  {item.title}
  {#if item.tag }
  <span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
  {/if}
  {#if item.indicator }
    <UIIndicator {...(item.indicator)} />
  {/if}
</a></li>
{:else }
<li class="is-no-follow-subtitle">
  {item.title}
  {#if item.tag }
  <span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
  {/if}
  {#if item.indicator }
    <UIIndicator {...(item.indicator)} />
  {/if}
</li>
{/if}
