<script>
    import { LOCALE } from "../../locale";

    /**
     * @typedef {Object} Props
     * @property {string} [title]
     * @property {boolean} [light]
     * @property {boolean} [loading]
     * @property {boolean} [raised]
     * @property {boolean} [outlined]
     * @property {boolean} [inverted]
     * @property {boolean} [rounded]
     * @property {boolean} [disabled]
     * @property {string} [state]
     * @property {string} [type]
     * @property {string} [color]
     * @property {string} [size]
     * @property {string} [class]
     * @property {boolean} [icon]
     * @property {string} [iconSide]
     * @property {function} [action]
     * @property {function} [onclick]
     * @property {any} value
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        title = "",
        light = false,
        loading = false,
        raised = false,
        outlined = false,
        inverted = false,
        rounded = false,
        disabled = false,
        state = "",
        type = "",
        color = "",
        size = "",
        class: classes = "",
        icon = false,
        iconSide = "right",
        onclick = () => {
            return true;
        },
        action = () => {
            return true;
        },
        value,
        children,
    } = $props();

    function onClick(event) {
        event.stopPropagation();
        onclick && onclick({ event, value });
        return action && action(event, value);
    }
</script>

<button
    onclick={onClick}
    {disabled}
    type={type ? type : ""}
    class="
  button
  {classes}
  {state ? `is-${state}` : ''}
  {inverted ? `is-inverted` : ''}
  {outlined ? `is-outlined` : ''}
  {raised ? `is-raised` : ''}
  {rounded ? `is-rounded` : ''}
  {light ? `is-light` : ''}
  {loading ? `is-loading` : ''}
  {color ? `is-${color}` : ''}
  {size ? `is-${size}` : ''}
  "
>
    {#if children}{@render children()}{:else if icon}
        {#if iconSide === "left"}
            <span class="icon"
                ><i class="fas fa-{icon} {size ? `is-${size}` : ''}"></i></span
            >
        {/if}
        {#if title}
            <span>{$LOCALE[title]}</span>
        {/if}
        {#if iconSide === "right"}
            <span class="icon"
                ><i class="fas fa-{icon} {size ? `is-${size}` : ''}"></i></span
            >
        {/if}
    {:else}
        {$LOCALE[title]}
    {/if}
</button>
