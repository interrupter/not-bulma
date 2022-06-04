<script>
  import {LOCALE} from '../../locale';

  export let LC_TRUE = 'not-node:booleans_true';
  export let LC_FALSE = 'not-node:booleans_false';
  export let values = [];
</script>

{#each values as item }
{#if item.value }
<span class="tag is-success">{$LOCALE[LC_TRUE]}</span>
{:else}
<span class="tag is-danger">{$LOCALE[LC_FALSE]}</span>
{/if}
{/each}
