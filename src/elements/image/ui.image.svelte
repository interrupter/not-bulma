<script>
    /**
     * @typedef {Object} Props
     * @property {any} urlFull
     * @property {any} url
     * @property {any} title
     * @property {string} [cors]
     * @property {number} [size]
     * @property {boolean} [contained]
     * @property {boolean} [covered]
     * @property {string} [classes]
     */

    /** @type {Props} */
    let {
        urlFull,
        url,
        title,
        cors = "anonymous",
        size = 64,
        contained = true,
        covered = true,
        classes = "",
        onclick = () => true,
        onkeyup = () => true,
    } = $props();

    let sizeStyle = $derived(isNaN(size) ? `is-${size}` : `is-${size}x${size}`);
    let containedStyle = $derived(contained ? "is-contained" : "");
    let coveredStyle = $derived(covered ? "is-covered" : "");
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
{#if urlFull}
    <a href={urlFull} alt={title} {onclick}>
        <figure
            class="image {sizeStyle} {containedStyle} {coveredStyle} {classes}"
        >
            <img class="" alt={title} src={url} crossOrigin={cors} />
        </figure>
    </a>
{:else}
    <figure class="image {sizeStyle} {containedStyle} {coveredStyle} {classes}">
        <img
            {onclick}
            {onkeyup}
            class=""
            alt={title}
            src={url}
            crossOrigin={cors}
        />
    </figure>
{/if}
