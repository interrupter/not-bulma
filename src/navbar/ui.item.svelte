<script>
  import UIItemContent from './ui.item.content.svelte';
  export let root = '';
  export let item = {};
  export let hidden ='';
  export let classes ='';
</script>

{#if item.break }
<hr class="navbar-divider {hidden?`is-hidden-${hidden}`:''} " />
{/if}

{#if item.url }
<a class="navbar-item {hidden?`is-hidden-${hidden}`:''} {classes} " href="{root}{item.url}">
  <UIItemContent {item} />
</a>
{:else}
<div class="navbar-item {hidden?`is-hidden-${hidden}`:''} {classes} ">
  <UIItemContent {item} />
</div>
{/if}
