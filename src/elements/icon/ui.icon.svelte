<script>
    /* eslint svelte/no-at-html-tags: 0 */

    import UIIconFont from "./ui.icon.font.svelte";

    /**
     * @typedef {Object} Props
     * @property {string} [title = ""] - font icon title
     * @property {string} [size = ""]  - font icon size
     * @property {string} [font = ""] - font icon name
     * @property {string} [svg = ""] - svg icon
     * @property {string} [src = ""] - image icon
     * @property {number|string} width
     * @property {number|string} height
     */

    /** @type {Props} */
    let {
        title = "",
        size = "",
        font = "",
        svg = "",
        src = "",
        width,
        height,
    } = $props();
</script>

{#if font}
    <UIIconFont {font} {size} {title}></UIIconFont>
{:else if svg}
    <span class="icon">{@html svg}</span>
{:else if src}
    <figure class="image {width && height ? `is-${width}x${height}` : ''} ">
        <img {src} {title} alt={title} {width} {height} />
    </figure>
{/if}
