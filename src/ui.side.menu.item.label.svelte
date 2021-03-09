<script>
  import UIIconText from './ui.icon.text.svelte';
  import UIIndicator from './ui.indicator.svelte';
  export let item = {};
</script>


{#if item.icon }
<UIIconText title={item.title} icon={item.icon} />
{:else}
{item.title}
{/if}
{#if item.tag }
  <span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
{/if}
{#if item.indicator }
  <UIIndicator {...(item.indicator)} />
{/if}
