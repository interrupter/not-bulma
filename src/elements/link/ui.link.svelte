<script>
    import { getContext, hasContext, onMount } from "svelte";
    import { LOCALE } from "../../locale";
    /**
     * @typedef {Object} Props
     * @property {string} [title] - attributes
     * @property {string} [href]
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
        href = "",
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
        class: classes = "",
        icon = false,
        iconSide = "right",
        action: onclick = () => {
            return true;
        },
        children,
    } = $props();

    const root = hasContext("root") ? getContext("root") || "" : "";
</script>

<a
    {onclick}
    {target}
    href={root + href}
    {download}
    {rel}
    class={[
        classes,
        button && "button",
        inverted && "is-inverted",
        outlined && "is-outlined",
        raised && "is-raised",
        rounded && "is-rounded",
        loading && "is-loading",
        light && `is-light`,
        color && `is-${color}`,
        state && `is-${state}`,
        type && `is-${type}`,
        size && `is-${size}`,
    ]}
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
