<script>
    /**
     * @typedef {Object} Props
     * @property {any} srcFull
     * @property {any} src
     * @property {any} title
     * @property {string} [cors]
     * @property {number} [size]
     * @property {boolean} [contained]
     * @property {boolean} [covered]
     * @property {string} [classes]
     */

    /** @type {Props} */
    let {
        srcFull,
        src,
        title,
        cors,
        size = 64,
        contained = true,
        covered = true,
        classes = "",
        onclick = () => {},
        onkeyup = () => {},
    } = $props();

    let sizeStyle = $derived(isNaN(size) ? `is-${size}` : `is-${size}x${size}`);
    let containedStyle = $derived(contained ? "is-contained" : "");
    let coveredStyle = $derived(covered ? "is-covered" : "");

    let crossOrigin = $derived(cors);
</script>

{#if srcFull}
    <a href={srcFull} alt={title} {onclick}>
        <figure
            class="image {sizeStyle} {containedStyle} {coveredStyle} {classes}"
        >
            <img class="" alt={title} {src} {crossOrigin} />
        </figure>
    </a>
{:else}
    <figure
        class="image {sizeStyle} {containedStyle} {coveredStyle} {classes}"
        {onclick}
        {onkeyup}
        role="button"
        tabindex="0"
    >
        <img class="" alt={title} {src} {crossOrigin} />
    </figure>
{/if}
