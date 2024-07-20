<script>
    import { LOCALE } from "../../locale";
    /**
     * @property {string} [title='']
     **/
    export let title = "";
    /**
     * @property {string} font
     **/
    export let font = "";
    /**
     * @property {string} [size=''] medium|large
     **/
    export let size = "";
    /**
     * @property {boolean} [pointable=false] medium|large
     **/
    export let pointable = false;
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
        icon {size ? `is-${size}` : ''} {size == 'medium' ? 'fa-lg' : ''}
{size == 'large' ? 'fa-2x' : ''}"
    >
        <i class="fas fa-{font}"></i>
    </span>
{/if}
