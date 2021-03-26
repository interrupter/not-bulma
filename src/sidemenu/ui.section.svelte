<script>
  import UIIndicator from '../ui.indicator.svelte';
  import UISideMenuItems from './ui.items.svelte';
  import {COMPONENTS} from '../frame/LIB.js';

  export let section;
  export let items = [];
  export let root = '';

  $: sectionItems = items.filter(item => section.id === item.section );
</script>

{#if section }
{#if sectionItems.length || section.component || section.tag || section.indicator }
<p class="menu-label {section.classes}">
  {#if (section.type==='component' && section.component && COMPONENTS.contains(section.component)) }
  <svelte:component
    this={COMPONENTS.get(section.component)}
    id={section.id}
    {...section.props}
     />
  {:else}
  {section.title}
  {/if}
  {#if section.tag }
    <UIIndicator id={section.id} {...section.tag} />
  {/if}
  {#if section.indicator }
    <UIIndicator id={section.id} {...section.indicator } />
  {/if}
</p>
{/if}
{/if}
{#if sectionItems.length }
<UISideMenuItems {root} items={sectionItems} on:navigate />
{/if}
