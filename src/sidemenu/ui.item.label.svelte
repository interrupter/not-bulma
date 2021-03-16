<script>
  import UIIcon from '../ui.icon.font.svelte';
  import UIIndicator from '../ui.indicator.svelte';
  import UITag from '../ui.tag.svelte';
  export let item = {};
</script>


{#if item.icon }
<UIIcon {...item.icon} />
{:else}
{item.title}
{/if}
{#if item.tag }
  <UIIndicator id={item.id} {...item.tag} />
{/if}
{#if item.indicator }
  <UIIndicator id={item.id} {...item.indicator } />
{/if}
