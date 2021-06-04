<script>
  import {LOCALE} from '../locale';
  import UIIcon from '../ui.icon.font.svelte';
  import UIIndicator from '../ui.indicator.svelte';
  import UITag from '../ui.tag.svelte';
  import {COMPONENTS} from '../frame/LIB.js';
  export let item = {};

</script>


{#if item.icon }
<UIIcon {...item.icon} />
{:else if (item.type==='component' && item.component && COMPONENTS.contains(item.component)) }
<svelte:component
  this={COMPONENTS.get(item.component)}
  id={item.id}
  {...item.props}
   />
{:else}
{$LOCALE[item.title]}
{/if}
{#if item.tag }
  <UITag id={item.id} {...item.tag} />
{/if}
{#if item.indicator }
  <UIIndicator id={item.id} {...item.indicator } />
{/if}
