<script>
  import notPath from 'not-path';
  import {
    onMount
  } from 'svelte';

  let title = '';

  onMount(() => {
    if (typeof field.type === 'undefined') {
      title = notPath.get(field.path, item, helpers);
    }
  });

  import {
    notCommon
  } from '../frame';
  import {
    LOCALE
  } from '../locale';

  import TableImages from '../ui.images.svelte';
  import TableLinks from '../ui.links.svelte';
  import TableButtons from '../ui.buttons.svelte';
  import TableBooleans from '../ui.booleans.svelte';
  import TableSwitch from './controls/ui.switch.svelte';
  import TableTags from './controls/ui.tags.svelte';

  export let getItemId = item => item._id;
  export let field = {};
  export let item = {};
  export let helpers = {};
</script>

<td class="{field.hideOnMobile?'is-hidden-touch':''}" {title}>
  {#if field.type === 'link' }
  <TableLinks values={ notPath.get(field.path, item, helpers) } />
  {:else if field.type === 'button' }
  <TableButtons values={ notPath.get(field.path, item, helpers) } />
  {:else if field.type === 'image' }
  <TableImages values={ notPath.get(field.path, item, helpers) } />
  {:else if field.type === 'boolean' }
  <TableBooleans values={ notPath.get(field.path, item, helpers) } />
  {:else if field.type === 'tag' }
  <TableTags values={ notPath.get(field.path, item, helpers) } />
  {:else if field.type === 'switch' }
  <TableSwitch id={getItemId(item)} fieldname={field.path} on:change="{field.onChange}" value={ notPath.get(field.path, item, helpers) } disabled={field.disabled} readonly={field.readonly} />
  {:else if field.type === 'component' }
  <svelte:component id={getItemId(item)} this={field.component} on:change="{field.onChange}" fieldname={field.path} disabled={field.disabled} readonly={field.readonly} value={ notPath.get(field.path, item, helpers) } {...field.options} />
  {:else}
  {#if !isNaN(field.maxLength) && field.maxLength }
  {notCommon.strLengthCap(notPath.get(field.path, item, helpers), field.maxLength)}
  {:else}
  {$LOCALE[notPath.get(field.path, item, helpers)]}
  {/if}
  {/if}
</td>
