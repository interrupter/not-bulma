<script>
  import UIIconFont from './ui.icon.font.svelte';
  
  
  
  
  /**
   * @typedef {Object} Props
   * @property {string} [title] - some label
   * @property {string} [size] - font icon
   * @property {string} [font]
   * @property {string} [svg] - svg icon
   * @property {string} [src] - image icon
   * @property {any} width
   * @property {any} height
   */

  /** @type {Props} */
  let {
      title = '',
      size = '',
      font = '',
      svg = '',
      src = '',
      width,
      height
  } = $props();
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
