<script>
  import UIIcon from '../ui.icon.svelte';
  import UITag from '../ui.tag.svelte';
  import UIIndicator from '../ui.indicator.svelte';
  import {COMPONENTS} from '../frame/LIB.js';
  export let item;
  /*
  string title
  object icon;
  object tag;
  string type;
  Class component;
  object indicator;
  object options;
  */


</script>

{#if item.icon}
<UIIcon {...item.icon} />
{:else if (item.type==='component' && item.component && COMPONENTS.contains(item.component)) }
<svelte:component
  this={COMPONENTS.get(item.component)}
  id={item.id}
  {...item.props}
   />
{:else}
{item.title}
{/if}

{#if item.tag }
<UITag top={true} right={true} size='small' id={item.id} {...item.tag}></UITag>
{/if}

{#if item.indicator }
<UIIndicator id={item.id} {...item.indicator} />
{/if}
