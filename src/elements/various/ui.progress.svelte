<script>
  /**
   * @typedef {Object} Props
   * @property {any} value
   * @property {number} [max]
   * @property {string} [color]
   * @property {string} [size]
   * @property {string} [classes]
   */

  /** @type {Props} */
  let {
      value,
      max = 100,
      color = "",
      size = "",
      classes = ""
  } = $props();
</script>

<progress
    class="
  progress
  {classes}
  {color ? `is-${color}` : ''}
  {size ? `is-${size}` : ''}"
    {value}
    {max}>{value}%</progress
>
