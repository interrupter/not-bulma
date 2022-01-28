<script>

  import {LOCALE} from '../../../locale';

  export let root = '';
  export let items = [];
  export let go = null;

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
    <li><a href="{root}{link.url}" data-href="{link.url}" on:click="{onClick}">{$LOCALE[link.title]}</a></li>
    {/if}
    {/if}
    {/each}
  </ul>
</nav>
