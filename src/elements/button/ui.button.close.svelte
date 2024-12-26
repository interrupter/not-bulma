<script>
    /**
     * @typedef {Object} Props
     * @property {string} [ariaLabel = "delete button"]
     * @property {boolean} [light]
     * @property {boolean} [loading]
     * @property {boolean} [raised]
     * @property {boolean} [outlined]
     * @property {boolean} [inverted]
     * @property {boolean} [rounded]
     * @property {boolean} [disabled]
     * @property {string} [state]
     * @property {string} [color]
     * @property {string} [size]
     * @property {string} [style]
     * @property {string} [class]
     * @property {function} [onclick]
     * @property {any} value
     */

    /** @type {Props} */
    let {
        ariaLabel = "delete button",
        light = false,
        loading = false,
        raised = false,
        outlined = false,
        inverted = false,
        rounded = false,
        disabled = false,
        state = "",
        color = "",
        size = "",
        style = "",
        class: classes = "",
        onclick = () => {
            return true;
        },
        value,
    } = $props();

    function onClick(event) {
        event.stopPropagation();
        onclick && onclick({ event, value });
    }
</script>

<button
    aria-label={ariaLabel}
    onclick={onClick}
    {disabled}
    {style}
    class="
  delete
  {classes}  
  {size ? `is-${size}` : ''}
  "
></button>
