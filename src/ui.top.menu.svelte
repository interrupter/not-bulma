<script>
  export let sections = [];
  export let items = [];
  export let root = '';
  export let navigate = null;

  function onClick(ev) {
    ev.preventDefault();
    if (typeof navigate === 'function') {
      navigate({
        full: ev.target.getAttribute('href'),
        short: ev.target.dataset.href
      });
    }
    return false;
  }
</script>


<div class="navbar-end mr-6">
  {#each sections as section }
  {#if items.filter(t=>t.section===section.id).length }
  <div class="navbar-item has-dropdown is-hoverable is-pulled-right">
    <a href class="navbar-link">{section.title}</a>
    <div class="navbar-dropdown">
      {#each items as item}
      {#if section.id === item.section }
      {#if item.break }
      <hr class="navbar-divider" />
      {/if}
      <a href class="navbar-item" href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">{item.title}
        {#if item.tag }
        <span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
        {/if}
      </a>
      {/if}
      {/each}
    </div>
  </div>
  {/if}
  {/each}
</div>
