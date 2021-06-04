<script>
  import {LOCALE} from './locale';
  export let title = '';
  export let font = '';
  export let size = '';
</script>

{#if title}
<span class="icon-text">
  <span class="icon {size?`is-${size}`:''}">
    <i class="fas
      fa-{font}
      {size=='medium'?'fa-lg':''}
      {size=='large'?'fa-2x':''}
      "></i>
  </span>
  <span>{$LOCALE[title]}</span>
</span>
{:else}
<span class="icon {size?`is-${size}`:''} {size=='medium'?'fa-lg':''}
{size=='large'?'fa-2x':''}">
  <i class="fas fa-{font}"></i>
</span>
{/if}
