<script>

  import {LOCALE} from '../../../locale';

  /**
   * @typedef {Object} Props
   * @property {string} [root]
   * @property {any} [items]
   * @property {any} [go]
   */

  /** @type {Props} */
  let { root = '', items = [], go = null } = $props();

  function onClick(ev){
    if(typeof go === 'function'){
      ev.preventDefault();
      go(ev.currentTarget.dataset.href);
      return false;
    }else{
      return true;
    }
  }

</script>

<nav class="breadcrumb" aria-label="breadcrumbs">
  <ul>
    {#each items as link, index}
    {#if (items.length === (index + 1)) }
    <li class="is-active"><a href="{root}{link.url}" data-href="{link.url}" aria-current="page">{$LOCALE[link.title]}</a></li>
    {:else }
    {#if link.url === false }
    <li class="is-plain-crumb">{$LOCALE[link.title]}</li>
    {:else}
    <li><a href="{root}{link.url}" data-href="{link.url}" onclick={onClick}>{$LOCALE[link.title]}</a></li>
    {/if}
    {/if}
    {/each}
  </ul>
</nav>
