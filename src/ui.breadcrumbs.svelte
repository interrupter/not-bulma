<script>

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
    <li class="is-active"><a href="{root}{link.url}" data-href="{link.url}" aria-current="page">{link.title}</a></li>
    {:else }
    <li>
      {#if link.url === false }
      {link.title}
      {:else}
      <a href="{root}{link.url}" data-href="{link.url}" on:click="{onClick}">{link.title}</a>
      {/if}
    </li>
    {/if}
    {/each}
  </ul>
</nav>
