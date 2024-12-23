<script>
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
     * @property {string} [class]
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
        state: activeState = "",
        type = "",
        color = "",
        size = "",
        class: classes = "",
        icon,
        iconSide = "right",
        action,
        onclick,
        children,
    } = $props();
</script>

{#snippet sideIcon()}
    <span class="icon"
        ><i class="fas fa-{icon} {size ? `is-${size}` : ''}"></i></span
    >
{/snippet}

<a
    onclick={action || onclick}
    href={url}
    {target}
    {download}
    {rel}
    class="{classes} {activeState ? `is-${activeState}` : ''} {color
        ? `is-${color}`
        : ''} {type ? `is-${type}` : ''} {size ? `is-${size}` : ''}"
    class:button
    class:is-light={light}
    class:is-inverted={inverted}
    class:is-outlined={outlined}
    class:is-raised={raised}
    class:is-rounded={rounded}
    class:is-loading={loading}
>
    {#if icon}
        {#if iconSide === "left"}{@render sideIcon()}{/if}
        {#if title}<span>{$LOCALE[title]}</span>{/if}
        {@render children?.()}
        {#if iconSide === "right"}{@render sideIcon()}{/if}
    {:else}{$LOCALE[title]}{@render children?.()}{/if}
</a>
