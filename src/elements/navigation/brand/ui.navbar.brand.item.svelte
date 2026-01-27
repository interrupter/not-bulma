<script>
    /* eslint svelte/no-at-html-tags: 0 */
    import UIIcon from "../../icon/ui.icon.svelte";
    /**
     * @typedef {Object} Props
     * @property {string} [url]
     * @property {string} [title]
     * @property {any} [icon]
     */

    /** @type {Props} */
    let {
        url = "/",
        title = "",
        icon = {
            src: "https://placehold.co/56x56.png",
            width: 56,
            height: 56,
        },
        classPrefix = "navbar-item",
        titleClass = "navbar-item-brand-title",
        class: classes = "",
    } = $props();
</script>

<a class={[classPrefix, classes].join(" ")} href={url} aria-label="brand">
    {#if icon}
        <UIIcon {...icon} />
    {/if}
    {#if title}
        <span class={titleClass}>{title}</span>
    {/if}
</a>
