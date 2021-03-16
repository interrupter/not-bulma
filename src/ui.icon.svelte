<script>
  import UIIconFont from './ui.icon.font.svelte';
  //some label
  export let title = '';
  //font icon
  export let size = '';
  export let font = '';
  //svg icon
  export let svg = '';
  //image icon
  export let src = '';
  export let width;
  export let height;
</script>

{#if font }
<UIIconFont {font} {size} {title}></UIIconFont>
{:else if svg }
<span class="icon">{@html svg}</span>
{:else if src }
<figure class="image {width&&height?`is-${width}x${height}`:''} ">
  <img {src} {title} alt={title} {width} {height}/>
</figure>
{/if}
