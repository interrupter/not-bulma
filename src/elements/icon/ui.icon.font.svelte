<script>
    import { LOCALE } from "../../locale";

    /**
     * @typedef {Object} Props
     * @property {string} [title = ""]
     * @property {string} [font = ""]
     * @property {string} [size = ""]
     * @property {string} [side = ""]
     * @property {string} [class = ""]
     * @property {boolean} [pointable = false]
     */

    /** @type {Props} */
    let {
        title = "",
        font = "",
        side = "",
        size = "",
        pointable = false,
    } = $props();
</script>

{#if title}
    <span class="icon-text {pointable ? 'is-clickable' : ''}">
        <span class="icon {size ? `is-${size}` : ''}">
            <i
                class="is-title-icon fas
      fa-{font}
      {size == 'medium' ? 'fa-lg' : ''}
      {size == 'large' ? 'fa-2x' : ''}
      "
            ></i>
            <span>{$LOCALE[title]}</span>
        </span>
    </span>
{:else}
    <span
        class="
        {pointable ? 'is-clickable' : ''}
        {side ? `is-${side}` : ''}
        icon {size ? `is-${size}` : ''} {size == 'medium' ? 'fa-lg' : ''}
{size == 'large' ? 'fa-2x' : ''}"
    >
        <i class="fas fa-{font}"></i>
    </span>
{/if}
