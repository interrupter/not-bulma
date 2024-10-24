<script>
  /**
   * @typedef {Object} Props
   * @property {string} [id]
   * @property {string} [classes]
   * @property {import('svelte').Snippet} [children]
   */

  /** @type {Props} */
  let { id = '', classes = '', children } = $props();
</script>

<footer {id} class="footer  {classes} ">
  {@render children?.()}
</footer>
