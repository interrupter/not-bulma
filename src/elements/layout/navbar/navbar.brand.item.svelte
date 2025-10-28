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
            src: "https://placehold.co/56x28.png",
            width: 28,
            height: 56,
        },
        class: classes = "",
    } = $props();
</script>

<a class={"navbar-item " + classes} href={url}>
    {#if icon}
        <UIIcon {...icon} />
    {/if}
    {#if title}
        <span class="navbar-item-brand-title">{title}</span>
    {/if}
</a>
