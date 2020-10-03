<script>
  import UIIndicator from './ui.indicator.svelte';
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
  {#each sections as section(section.id) }
  {#if items.filter(t => t.section === section.id).length || section.indicator || section.tag }
  <div class="navbar-item has-dropdown is-hoverable is-pulled-right">
    <a href class="navbar-link">
      {section.title}
      {#if section.tag }
      <span class="ml-3 tag is-{section.tag.type} is-pulled-right">{section.tag.label}</span>
      {/if}
      {#if section.indicator }
        <UIIndicator {...(section.indicator)} />
      {/if}
    </a>
    {#if items.filter(t => t.section === section.id).length }
    <div class="navbar-dropdown">
      {#each items as item}
      {#if section.id === item.section }
      {#if item.break }
      <hr class="navbar-divider" />
      {/if}
      <a class="navbar-item" href="{root}{item.url}" data-href="{item.url}" on:click="{onClick}">{item.title}
        {#if item.tag }
        <span class="ml-3 tag is-{item.tag.type} is-pulled-right">{item.tag.label}</span>
        {/if}
        {#if item.indicator }
          <UIIndicator {...(item.indicator)} />
        {/if}
      </a>
      {/if}
      {/each}
    </div>
    {/if}
  </div>
  {/if}
  {/each}
</div>
