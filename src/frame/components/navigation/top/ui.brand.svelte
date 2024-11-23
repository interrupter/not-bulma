<script>
    import UIIcon from "../../../../elements/icon/ui.icon.svelte";
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
            src: "https://via.placeholder.com/56x28",
            width: 28,
            height: 56,
        },
    } = $props();
</script>

<a class="navbar-item" href={url}>
    <UIIcon {...icon} />
    {#if title}
        {@html `<span class="navbar-item-brand-title">${title}</span>`}
    {/if}
</a>
