<script>
    import { run } from 'svelte/legacy';

    import { LOCALE } from "../../locale";
    
    

    

    /**
     * @typedef {Object} Props
     * @property {string} [title] - attributes
     * @property {string} [url]
     * @property {any} download
     * @property {string} [target]
     * @property {any} rel
     * @property {boolean} [light] - visual
     * @property {boolean} [loading]
     * @property {boolean} [raised]
     * @property {boolean} [outlined]
     * @property {boolean} [inverted]
     * @property {boolean} [rounded]
     * @property {boolean} [button]
     * @property {string} [state]
     * @property {string} [type]
     * @property {string} [color]
     * @property {string} [size]
     * @property {string} [classes]
     * @property {boolean} [icon] - icons
     * @property {string} [iconSide]
     * @property {any} [action]
     * @property {import('svelte').Snippet} [children]
     */

    /** @type {Props} */
    let {
        title = "",
        url = "",
        download,
        target = "_blank",
        rel,
        light = false,
        loading = false,
        raised = false,
        outlined = false,
        inverted = false,
        rounded = false,
        button = true,
        state = "",
        type = "",
        color = "",
        size = "",
        classes = $bindable(""),
        icon = false,
        iconSide = "right",
        action = () => {
            return true;
        },
        children
    } = $props();

    run(() => {
        classes =
            (button ? "button " : "") +
            (state && state.length > 0 ? ` is-${state} ` : "") +
            (light ? ` is-light ` : "") +
            (type && type.length > 0 ? ` is-${type} ` : "") +
            (size && size.length > 0 ? ` is-${size} ` : "");
    });
</script>

<a
    onclick={action}
    {target}
    href={url}
    {download}
    {rel}
    class="{classes} {state ? `is-${state}` : ''} {inverted
        ? `is-inverted`
        : ''} {outlined ? `is-outlined` : ''} {raised
            ? `is-raised`
            : ''} {rounded ? `is-rounded` : ''} {light ? `is-light` : ''} {loading
                ? `is-loading`
                : ''} {color ? `is-${color}` : ''} {type ? `is-${type}` : ''} {size
                    ? `is-${size}`
                    : ''}"
>
    {#if icon}
        {#if iconSide === "left"}
            <span class="icon"
                ><i class="fas fa-{icon} {size ? `is-${size}` : ''}"></i></span
            >
        {/if}
        {#if title}
            <span>{$LOCALE[title]}</span>
        {/if}
        {@render children?.()}
        {#if iconSide === "right"}
            <span class="icon"
                ><i class="fas fa-{icon} {size ? `is-${size}` : ''}"></i></span
            >
        {/if}
    {:else}
        {$LOCALE[title]}
        {@render children?.()}
    {/if}
</a>
