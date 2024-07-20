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
    <span class="icon-text {pointable ? 'is-pointable' : ''}">
        <span class="icon {size ? `is-${size}` : ''}">
            <i
                class="fas
      fa-{font}
      {size == 'medium' ? 'fa-lg' : ''}
      {size == 'large' ? 'fa-2x' : ''}
      "
            ></i>
        </span>
        <span>{$LOCALE[title]}</span>
    </span>
{:else}
    <span
        class="
        {pointable ? 'is-pointable' : ''}
        icon {size ? `is-${size}` : ''} {size == 'medium' ? 'fa-lg' : ''}
{size == 'large' ? 'fa-2x' : ''}"
    >
        <i class="fas fa-{font}"></i>
    </span>
{/if}
