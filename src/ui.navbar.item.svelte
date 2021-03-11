<script>
  export let item = {};
  export let hidden = '';
  export let dropdown = false;
  export let hoverable = true;
</script>

{#if item.link }
<a class="navbar-item" href="{item.url}">{item.title}</a>
{:else}
<div class="navbar-item {item.type === 'dropdown'?'has-dropdown':''} {hidden?`is-hidden-${hidden}`:''} {hoverable?'is-hoverable':''}">
  {#if item.type==='custom' && item.component }
  <svelte:component
    this={item.component}
    {item}
    {...item.options} />
  {:else if item.type==='icon' }

  {/if}
</div>
{/if}
